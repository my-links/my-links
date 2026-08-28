import { inject } from '@adonisjs/core';
import { randomUUID } from 'node:crypto';
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
	// Keys into `collections` above — a link can belong to several.
	collectionKeys: string[];
};

type ExportData = {
	collections: Array<{
		// Random per-export identifier, unrelated to the real DB id — lets a
		// hand-edited file drop a collection without shifting every other
		// link's references (see git history for the index-based bug this
		// replaced).
		key: string;
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
		key?: string;
		name: string;
		description?: string | null;
		visibility: string;
		icon?: string | null;
		// Legacy format: links nested under a single collection.
		links?: Array<ImportLink>;
	}>;
	// Top-level links, referencing collections either by key (current
	// format) or by array index (format predating per-collection keys).
	links?: Array<
		ImportLink & { collectionKeys?: string[]; collectionIndexes?: number[] }
	>;
};

type CollectionRef = {
	collectionKeys?: string[];
	collectionIndexes?: number[];
};
type LinkToCreate = { link: ImportLink } & CollectionRef;

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

		const exportKeys: string[] = collections.map(() => randomUUID());
		const exportKeyById = new Map<number, string>(
			collections.map((collection, index) => [collection.id, exportKeys[index]])
		);

		// A link can be nested under several collections above — dedupe by id
		// so it appears once in the export, with all its collectionKeys.
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
			collections: collections.map((collection, index) => ({
				key: exportKeys[index],
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
				collectionKeys: link.collections
					.map((collection) => exportKeyById.get(collection.id))
					.filter((key): key is string => key !== undefined),
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

			const createdCollectionIdByKey = new Map(
				validatedData.collections
					.map((collectionData, index) => [
						collectionData.key,
						createdCollections[index]?.id,
					])
					.filter(
						(entry): entry is [string, number] =>
							entry[0] !== undefined && entry[1] !== undefined
					)
			);

			const linksToCreate = this.collectLinksToImport(validatedData);

			for (const {
				link: linkData,
				collectionKeys,
				collectionIndexes,
			} of linksToCreate) {
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
					{ collectionKeys, collectionIndexes },
					createdCollections,
					createdCollectionIdByKey,
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
	 * Resolves a link's collection references to freshly-created collection
	 * ids: by key when present (current format, immune to a hand-edited file
	 * dropping a collection), falling back to array index (older export
	 * formats). Falls back to Inbox when nothing resolves — every link must
	 * keep at least one collection.
	 */
	private async resolveImportedCollectionIds(
		userId: User['id'],
		{ collectionKeys, collectionIndexes }: CollectionRef,
		createdCollections: Collection[],
		createdCollectionIdByKey: Map<string, number>,
		transaction: TransactionClientContract
	): Promise<number[]> {
		const collectionIds = collectionKeys?.length
			? collectionKeys
					.map((key) => createdCollectionIdByKey.get(key))
					.filter((id): id is number => id !== undefined)
			: (collectionIndexes ?? [])
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
	 * Flattens every export format into a single list: links nested under a
	 * single collection (oldest, pre multi-collection — a nested link maps to
	 * exactly its parent's index), top-level links keyed by collection index
	 * (format predating per-collection keys), and top-level links keyed by
	 * collection key (current format).
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
			collectionKeys: link.collectionKeys,
			collectionIndexes: link.collectionIndexes,
		}));

		return [...nestedLinks, ...topLevelLinks];
	}
}
