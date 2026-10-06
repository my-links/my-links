import { inject } from '@adonisjs/core';
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

@inject()
export class FaviconAdminService {
	constructor(
		private readonly store: FaviconStoreService,
		private readonly resolutionService: FaviconResolutionService,
		private readonly epochService: FaviconEpochService
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

	/** Also bumps the epoch, since deleting rows does nothing to a browser that cached `/favicon` for a week. */
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

	/** A success clears its failure row via `forceRefresh`; a repeat failure stays recorded. */
	async reResolveFailures(): Promise<FaviconReResolveResult> {
		const failures = await FaviconFailure.all();
		return this.forceRefreshOrigins(failures.map((failure) => failure.origin));
	}

	/** Unlike `flushAll`, nothing is deleted first, so links keep their old icon until the re-scrape lands. */
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

	/** Bumps the epoch only when something changed, so a no-op run does not force every browser to re-fetch. */
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
