import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { CollectionService } from '#services/collections/collection_service';
import { ActivityEventService } from '#services/activity/activity_event_service';
import { CollectionLinkService } from '#services/collections/collection_link_service';

type ExportLink = {
	name: string;
	description: string | null;
	url: string;
	favorite: boolean;
	// Indexes into `collections` above — a link can belong to several.
	collectionIndexes: number[];
};

type ExportData = {
	collections: Array<{
		name: string;
		description: string | null;
		visibility: string;
		icon: string | null;
	}>;
	links: Array<ExportLink>;
};

type ImportLink = {
	name: string;
	description?: string | null;
	url: string;
	favorite: boolean;
};

type ValidatedImportData = {
	collections: Array<{
		name: string;
		description?: string | null;
		visibility: string;
		icon?: string | null;
		// Legacy format: links nested under a single collection.
		links?: Array<ImportLink>;
	}>;
	// New format: links at the top level referencing collections by index.
	links?: Array<ImportLink & { collectionIndexes: number[] }>;
};

type LinkToCreate = { link: ImportLink; collectionIndexes: number[] };

@inject()
export class ExportImportService {
	constructor(
		protected readonly collectionService: CollectionService,
		protected readonly activityEventService: ActivityEventService,
		protected readonly collectionLinkService: CollectionLinkService
	) {}

	async exportUserData(userId: User['id']): Promise<ExportData> {
		const collections = await Collection.query()
			.where('author_id', userId)
			.preload('links', (linksQuery) => {
				linksQuery.preload('collections').orderBy('name', 'asc');
			})
			.orderBy('name', 'asc');

		const collectionIndexById = new Map(
			collections.map((collection, index) => [collection.id, index])
		);

		// A link can be nested under several collections above — dedupe by id
		// so it appears once in the export, with all its collectionIndexes.
		const linksById = new Map<number, Link>();
		for (const collection of collections) {
			for (const link of collection.links) {
				linksById.set(link.id, link);
			}
		}

		await this.activityEventService.record({
			type: ACTIVITY_EVENT_TYPE.DATA_EXPORTED,
			userId,
			subjectType: AUDIT_SUBJECT_TYPE.ACCOUNT,
			subjectId: userId,
		});

		return {
			collections: collections.map((collection) => ({
				name: collection.name,
				description: collection.description,
				visibility: collection.visibility,
				icon: collection.icon,
			})),
			links: [...linksById.values()].map((link) => ({
				name: link.name,
				description: link.description,
				url: link.url,
				favorite: link.favorite,
				collectionIndexes: link.collections
					.map((collection) => collectionIndexById.get(collection.id))
					.filter((index): index is number => index !== undefined),
			})),
		};
	}

	importUserData(userId: User['id'], validatedData: ValidatedImportData) {
		return db.transaction(async (transaction) => {
			const createdCollections = await Collection.createMany(
				validatedData.collections.map((collectionData) => ({
					name: collectionData.name,
					description: collectionData.description ?? null,
					visibility: collectionData.visibility as any,
					icon: collectionData.icon ?? null,
					authorId: userId,
				})),
				{ client: transaction }
			);

			const linksToCreate = this.collectLinksToImport(validatedData);

			for (const { link: linkData, collectionIndexes } of linksToCreate) {
				const link = await Link.create(
					{
						name: linkData.name,
						description: linkData.description ?? null,
						url: linkData.url,
						favorite: linkData.favorite,
						authorId: userId,
					},
					{ client: transaction }
				);

				const collectionIds = await this.resolveImportedCollectionIds(
					userId,
					collectionIndexes,
					createdCollections,
					transaction
				);
				const attachments =
					await this.collectionLinkService.buildPositionedAttachments(
						collectionIds,
						transaction
					);
				await link.related('collections').attach(attachments, transaction);
			}

			await this.activityEventService.record(
				{
					type: ACTIVITY_EVENT_TYPE.DATA_IMPORTED,
					userId,
					subjectType: AUDIT_SUBJECT_TYPE.ACCOUNT,
					subjectId: userId,
					metadata: {
						collections: createdCollections.length,
						links: linksToCreate.length,
					},
				},
				transaction
			);
		});
	}

	/**
	 * Maps a link's collection indexes to the freshly-created collection ids,
	 * falling back to Inbox when a (malformed) file references none — every
	 * link must keep at least one collection.
	 */
	private async resolveImportedCollectionIds(
		userId: User['id'],
		collectionIndexes: number[],
		createdCollections: Collection[],
		transaction: TransactionClientContract
	): Promise<number[]> {
		const collectionIds = collectionIndexes
			.map((index) => createdCollections[index]?.id)
			.filter((id): id is number => id !== undefined);

		if (collectionIds.length > 0) {
			return collectionIds;
		}

		const defaultCollection =
			await this.collectionService.getOrCreateDefaultCollection(
				userId,
				transaction
			);
		return [defaultCollection.id];
	}

	/**
	 * Flattens both export formats into a single list: the current one (links
	 * at the top level referencing collections by index) and the legacy one
	 * (links nested under a single collection). Old export files predate
	 * multi-collection, so a nested link maps to exactly its parent's index.
	 */
	private collectLinksToImport(
		validatedData: ValidatedImportData
	): LinkToCreate[] {
		const nestedLinks = validatedData.collections.flatMap(
			(collectionData, collectionIndex) =>
				(collectionData.links ?? []).map((link) => ({
					link,
					collectionIndexes: [collectionIndex],
				}))
		);

		const topLevelLinks = (validatedData.links ?? []).map((link) => ({
			link,
			collectionIndexes: link.collectionIndexes,
		}));

		return [...nestedLinks, ...topLevelLinks];
	}
}
