import db from '@adonisjs/lucid/services/db';

import { cache } from '#lib/cache';
import FaviconEntry from '#models/favicon_entry';
import FaviconFailure from '#models/favicon_failure';
import { FaviconEpochService } from '#services/favicons/favicon_epoch_service';
import { FaviconStoreService } from '#services/favicons/favicon_store_service';
import { FaviconResolutionService } from '#services/favicons/favicon_resolution_service';

export type FaviconAdminStats = {
	entryCount: number;
	totalBytes: number;
	failureCount: number;
};

export type FaviconFlushResult = {
	deletedEntries: number;
};

export type FaviconReResolveResult = {
	attempted: number;
	succeeded: number;
};

export class FaviconAdminService {
	constructor(
		private readonly store: FaviconStoreService = new FaviconStoreService(),
		private readonly resolutionService: FaviconResolutionService = new FaviconResolutionService(),
		private readonly epochService: FaviconEpochService = new FaviconEpochService()
	) {}

	async getStats(): Promise<FaviconAdminStats> {
		const row = await db
			.from('favicon_entries')
			.count('* as entryCount')
			.sum('byte_size as totalBytes')
			.first();
		const failureCount = await db.from('favicon_failures').count('* as total');

		return {
			entryCount: Number(row?.entryCount ?? 0),
			totalBytes: Number(row?.totalBytes ?? 0),
			failureCount: Number(failureCount[0].total),
		};
	}

	/**
	 * Wipes every resolved favicon, on disk and in the DB — the next render of
	 * each link lazily re-resolves it, so this is safe to run at any time, just
	 * a burst of re-scraping right after. Also bumps the epoch: deleting the
	 * server-side rows does nothing on its own to a browser that already
	 * cached `/favicon?url=...&v=<epoch>` for a week.
	 */
	async flushAll(): Promise<FaviconFlushResult> {
		const deletedEntries = await db.from('favicon_entries').count('* as total');

		for (const hash of await this.store.listStoredHashes()) {
			await this.store.delete(hash);
		}
		await FaviconEntry.query().delete();
		await FaviconFailure.query().delete();
		await cache.namespace('favicon:meta').clear();
		await cache.namespace('favicon:error').clear();
		await this.epochService.bump();

		return { deletedEntries: Number(deletedEntries[0].total) };
	}

	/**
	 * Retries every origin with a recorded failure. A success clears its
	 * failure row as a side effect of `forceRefresh`; one that fails again
	 * stays recorded for the next pass.
	 */
	async reResolveFailures(): Promise<FaviconReResolveResult> {
		const failures = await FaviconFailure.all();
		return this.forceRefreshOrigins(failures.map((failure) => failure.origin));
	}

	/**
	 * Re-scrapes every known origin, resolved or failing, in place — unlike
	 * `flushAll`, nothing is deleted first, so a link keeps showing its old
	 * icon (rather than a monogram) until its re-scrape actually lands.
	 */
	async reResolveAll(): Promise<FaviconReResolveResult> {
		const [entries, failures] = await Promise.all([
			FaviconEntry.query().select('origin'),
			FaviconFailure.query().select('origin'),
		]);
		const origins = new Set([
			...entries.map((entry) => entry.origin),
			...failures.map((failure) => failure.origin),
		]);

		return this.forceRefreshOrigins([...origins]);
	}

	/**
	 * Bumps the epoch only when something actually changed — a run that finds
	 * nothing to fix (or fixes nothing) shouldn't force every browser to
	 * re-fetch every favicon for no reason.
	 */
	private async forceRefreshOrigins(
		origins: string[]
	): Promise<FaviconReResolveResult> {
		const outcomes = await Promise.allSettled(
			origins.map((origin) => this.resolutionService.forceRefresh(origin))
		);
		const succeeded = outcomes.filter(
			(outcome) => outcome.status === 'fulfilled'
		).length;

		if (succeeded > 0) {
			await this.epochService.bump();
		}

		return { attempted: origins.length, succeeded };
	}
}
