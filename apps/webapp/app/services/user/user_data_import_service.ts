import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import {
	IMPORT_INSERT_CHUNK_SIZE,
	MAXIMUM_IMPORT_LINKS,
	MAXIMUM_IMPORT_COLLECTIONS,
} from '#constants/data_import';
import type { Visibility } from '#enums/collections/visibility';
import { ImportTooLargeException } from '#exceptions/user_settings/import_too_large_exception';
import type { RequestOrigin } from '#lib/request_origin';
import Collection from '#models/collection';
import type User from '#models/user';
import { ActivityEventService } from '#services/activity/activity_event_service';
import { CollectionLinkService } from '#services/collections/collection_link_service';
import { CollectionService } from '#services/collections/collection_service';

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
		visibility: Visibility;
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
type AttachmentRow = {
	collection_id: number;
	link_id: number;
	position: number;
	created_at: Date;
};
type LinkToCreate = { link: ImportLink } & CollectionRef;

@inject()
export class UserDataImportService {
	constructor(
		protected readonly collectionService: CollectionService,
		protected readonly activityEventService: ActivityEventService,
		protected readonly collectionLinkService: CollectionLinkService
	) {}

	importUserData(
		userId: User['id'],
		validatedData: ValidatedImportData,
		origin: RequestOrigin
	) {
		this.assertWithinLimits(validatedData);

		return db.transaction(async (transaction) => {
			const createdCollections = await Collection.createMany(
				validatedData.collections.map((collectionData) => ({
					name: collectionData.name,
					description: collectionData.description ?? null,
					visibility: collectionData.visibility,
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
			const createdLinkIds = await this.insertLinks(
				userId,
				linksToCreate.map(({ link }) => link),
				transaction
			);

			const resolveDefaultCollectionId = this.memoizeDefaultCollectionId(
				userId,
				origin,
				transaction
			);
			const nextPositionByCollectionId = new Map<number, number>(
				createdCollections.map((collection) => [collection.id, 0])
			);
			const attachmentRows: AttachmentRow[] = [];

			for (const [index, collectionRef] of linksToCreate.entries()) {
				const collectionIds = await this.resolveImportedCollectionIds(
					collectionRef,
					createdCollections,
					createdCollectionIdByKey,
					resolveDefaultCollectionId
				);

				for (const collectionId of collectionIds) {
					const position = await this.takeNextPosition(
						collectionId,
						nextPositionByCollectionId,
						transaction
					);
					attachmentRows.push({
						collection_id: collectionId,
						link_id: createdLinkIds[index],
						position,
						created_at: new Date(),
					});
				}
			}

			await this.insertAttachments(attachmentRows, transaction);

			await this.activityEventService.record(
				{
					type: ACTIVITY_EVENT_TYPE.DATA_IMPORTED,
					userId,
					origin,
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
	 * formats). Falls back to Inbox when nothing resolves: every link must
	 * keep at least one collection. Ids are deduplicated because the pivot's
	 * primary key is (collection, link).
	 */
	private async resolveImportedCollectionIds(
		{ collectionKeys, collectionIndexes }: CollectionRef,
		createdCollections: Collection[],
		createdCollectionIdByKey: Map<string, number>,
		resolveDefaultCollectionId: () => Promise<number>
	): Promise<number[]> {
		const collectionIds = collectionKeys?.length
			? collectionKeys
					.map((key) => createdCollectionIdByKey.get(key))
					.filter((id): id is number => id !== undefined)
			: (collectionIndexes ?? [])
					.map((index) => createdCollections[index]?.id)
					.filter((id): id is number => id !== undefined);

		if (collectionIds.length > 0) {
			return [...new Set(collectionIds)];
		}

		return [await resolveDefaultCollectionId()];
	}

	private memoizeDefaultCollectionId(
		userId: User['id'],
		origin: RequestOrigin,
		transaction: TransactionClientContract
	): () => Promise<number> {
		let defaultCollectionId: number | undefined;

		return async () => {
			if (defaultCollectionId === undefined) {
				const defaultCollection =
					await this.collectionService.getOrCreateDefaultCollection(
						userId,
						origin,
						transaction
					);
				defaultCollectionId = defaultCollection.id;
			}

			return defaultCollectionId;
		};
	}

	private async takeNextPosition(
		collectionId: number,
		nextPositionByCollectionId: Map<number, number>,
		transaction: TransactionClientContract
	): Promise<number> {
		const position =
			nextPositionByCollectionId.get(collectionId) ??
			(await this.collectionLinkService.getNextLinkPosition(
				collectionId,
				transaction
			));
		nextPositionByCollectionId.set(collectionId, position + 1);

		return position;
	}

	private async insertLinks(
		userId: User['id'],
		links: ImportLink[],
		transaction: TransactionClientContract
	): Promise<number[]> {
		const now = new Date();
		const linkRows = links.map((link) => ({
			name: link.name,
			description: link.description ?? null,
			url: link.url,
			favorite: link.favorite,
			author_id: userId,
			created_at: now,
			updated_at: now,
		}));
		const createdLinkIds: number[] = [];

		for (const chunk of this.chunkRows(linkRows)) {
			const insertedRows: Array<{ id: number }> = await transaction
				.insertQuery()
				.table('links')
				.multiInsert(chunk)
				.returning('id');
			createdLinkIds.push(...insertedRows.map((row) => row.id));
		}

		return createdLinkIds;
	}

	private async insertAttachments(
		attachmentRows: AttachmentRow[],
		transaction: TransactionClientContract
	): Promise<void> {
		for (const chunk of this.chunkRows(attachmentRows)) {
			await transaction
				.insertQuery()
				.table('collection_link')
				.multiInsert(chunk);
		}
	}

	private chunkRows<Row>(rows: Row[]): Row[][] {
		const chunks: Row[][] = [];

		for (
			let offset = 0;
			offset < rows.length;
			offset += IMPORT_INSERT_CHUNK_SIZE
		) {
			chunks.push(rows.slice(offset, offset + IMPORT_INSERT_CHUNK_SIZE));
		}

		return chunks;
	}

	private assertWithinLimits(validatedData: ValidatedImportData): void {
		const linkCount = this.collectLinksToImport(validatedData).length;

		if (
			validatedData.collections.length > MAXIMUM_IMPORT_COLLECTIONS ||
			linkCount > MAXIMUM_IMPORT_LINKS
		) {
			throw new ImportTooLargeException(
				`An import can hold at most ${MAXIMUM_IMPORT_COLLECTIONS} collections and ${MAXIMUM_IMPORT_LINKS} links`
			);
		}
	}

	/**
	 * Flattens every export format into a single list: links nested under a
	 * single collection (oldest, pre multi-collection: a nested link maps to
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
