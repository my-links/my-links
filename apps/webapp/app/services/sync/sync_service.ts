import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';

import Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';
import { SyncJournalService } from '#services/sync/sync_journal_service';

/**
 * How long a tombstone stays queryable. A client whose cursor predates this
 * window can no longer be brought up to date incrementally — deletions it
 * never saw have been pruned — so it is served a full snapshot instead.
 */
export const TOMBSTONE_RETENTION_DAYS = 30;

/**
 * Rows committed while a delta request is in flight can carry a timestamp
 * marginally older than the cursor the client is handed back. Re-sending a
 * second of overlap is harmless (clients upsert by id) whereas skipping those
 * rows would drop the change permanently.
 */
const CURSOR_OVERLAP_MS = 1_000;

const FULL_SYNC_CURSOR = DateTime.fromMillis(0);

export type SyncDelta = {
	syncedAt: DateTime;
	isFullSync: boolean;
	collections: Collection[];
	links: Link[];
	deletedCollectionIds: Collection['id'][];
	deletedLinkIds: Link['id'][];
};

/**
 * Read side of the delta feed. Entities are keyed by `updated_at` and
 * removals by the tombstone journal, so a client only ever transfers what
 * changed since its last successful sync instead of the whole tree.
 */
@inject()
export class SyncService {
	constructor(private readonly syncJournalService: SyncJournalService) {}

	async getDelta(userId: User['id'], since?: DateTime): Promise<SyncDelta> {
		const syncedAt = DateTime.now();
		const retentionCutoff = this.getRetentionCutoff(syncedAt);
		const cursor = this.resolveCursor(since, retentionCutoff);
		const isFullSync = cursor === FULL_SYNC_CURSOR;

		if (!isFullSync) {
			await this.syncJournalService.pruneDeletionsBefore(
				userId,
				retentionCutoff
			);
		}

		const deletions = isFullSync
			? { collectionIds: [], linkIds: [] }
			: await this.syncJournalService.getDeletionsSince(userId, cursor);

		return {
			syncedAt,
			isFullSync,
			collections: await this.getCollectionsChangedSince(userId, cursor),
			links: await this.getLinksChangedSince(userId, cursor),
			deletedCollectionIds: deletions.collectionIds,
			deletedLinkIds: deletions.linkIds,
		};
	}

	/**
	 * A cursor older than the retention window is unusable: the deletions it
	 * missed are already pruned, so honouring it would leave the client
	 * holding entities the server no longer has.
	 */
	private resolveCursor(
		since: DateTime | undefined,
		retentionCutoff: DateTime
	): DateTime {
		if (!since || since < retentionCutoff) {
			return FULL_SYNC_CURSOR;
		}
		return since.minus({ milliseconds: CURSOR_OVERLAP_MS });
	}

	private getRetentionCutoff(syncedAt: DateTime): DateTime {
		return syncedAt.minus({ days: TOMBSTONE_RETENTION_DAYS });
	}

	private async getCollectionsChangedSince(
		userId: User['id'],
		cursor: DateTime
	): Promise<Collection[]> {
		return await Collection.query()
			.where('author_id', userId)
			.andWhere('updated_at', '>=', cursor.toJSDate())
			.orderBy('name', 'asc');
	}

	private async getLinksChangedSince(
		userId: User['id'],
		cursor: DateTime
	): Promise<Link[]> {
		return await Link.query()
			.where('author_id', userId)
			.andWhere('updated_at', '>=', cursor.toJSDate())
			.preload('collections')
			.orderBy('name', 'asc');
	}
}
