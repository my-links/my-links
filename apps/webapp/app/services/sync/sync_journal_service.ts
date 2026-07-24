import { DateTime } from 'luxon';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import type User from '#models/user';
import type Link from '#models/link';
import type Collection from '#models/collection';

export const SyncEntityType = {
	COLLECTION: 'collection',
	LINK: 'link',
} as const;

export type SyncEntityType =
	(typeof SyncEntityType)[keyof typeof SyncEntityType];

export type SyncDeletions = {
	collectionIds: Collection['id'][];
	linkIds: Link['id'][];
};

type SyncDeletionRow = {
	entity_type: string;
	entity_id: number;
};

const SYNC_DELETIONS_TABLE = 'sync_deletions';
const LINKS_TABLE = 'links';

/**
 * Write side of the delta feed (`GET /api/v1/sync`).
 *
 * Everything in this app is hard-deleted (`ON DELETE CASCADE` all the way
 * down), so a client syncing on `updated_at` alone can never learn that a row
 * disappeared — this append-only journal is what tells it. A tombstone table
 * is deliberately preferred over a `deleted_at` column on every table: soft
 * deletes would force every existing query in the app to filter them out, and
 * one missed `whereNull` would leak deleted rows back to users.
 */
export class SyncJournalService {
	recordDeletedCollection(
		authorId: User['id'],
		collectionId: Collection['id'],
		client?: TransactionClientContract
	): Promise<void> {
		return this.recordDeletion(
			authorId,
			SyncEntityType.COLLECTION,
			collectionId,
			client
		);
	}

	recordDeletedLink(
		authorId: User['id'],
		linkId: Link['id'],
		client?: TransactionClientContract
	): Promise<void> {
		return this.recordDeletion(authorId, SyncEntityType.LINK, linkId, client);
	}

	/**
	 * Membership lives in the `collection_link` pivot, so attaching or
	 * detaching a link leaves the link row itself untouched — and therefore
	 * invisible to a cursor based on `links.updated_at`. Bumping it here is
	 * what turns a pure membership change into a "move" event on the feed.
	 */
	async markLinksChanged(
		linkIds: Link['id'][],
		client?: TransactionClientContract
	): Promise<void> {
		if (linkIds.length === 0) {
			return;
		}

		await this.selectFrom(LINKS_TABLE, client)
			.whereIn('id', linkIds)
			.update({ updated_at: DateTime.now().toJSDate() });
	}

	async getDeletionsSince(
		authorId: User['id'],
		since: DateTime
	): Promise<SyncDeletions> {
		const rows: SyncDeletionRow[] = await db
			.from(SYNC_DELETIONS_TABLE)
			.select('entity_type', 'entity_id')
			.where('author_id', authorId)
			.andWhere('deleted_at', '>=', since.toJSDate());

		return {
			collectionIds: this.pickEntityIds(rows, SyncEntityType.COLLECTION),
			linkIds: this.pickEntityIds(rows, SyncEntityType.LINK),
		};
	}

	async pruneDeletionsBefore(
		authorId: User['id'],
		cutoff: DateTime
	): Promise<void> {
		await db
			.from(SYNC_DELETIONS_TABLE)
			.where('author_id', authorId)
			.andWhere('deleted_at', '<', cutoff.toJSDate())
			.delete();
	}

	private async recordDeletion(
		authorId: User['id'],
		entityType: SyncEntityType,
		entityId: number,
		client?: TransactionClientContract
	): Promise<void> {
		const insertQuery = client
			? client.table(SYNC_DELETIONS_TABLE)
			: db.table(SYNC_DELETIONS_TABLE);

		await insertQuery.insert({
			author_id: authorId,
			entity_type: entityType,
			entity_id: entityId,
			deleted_at: DateTime.now().toJSDate(),
		});
	}

	private pickEntityIds(
		rows: SyncDeletionRow[],
		entityType: SyncEntityType
	): number[] {
		return rows
			.filter((row) => row.entity_type === entityType)
			.map((row) => Number(row.entity_id));
	}

	private selectFrom(tableName: string, client?: TransactionClientContract) {
		if (client) {
			return client.from(tableName);
		}
		return db.from(tableName);
	}
}
