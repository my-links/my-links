import { inject } from '@adonisjs/core';

import Link from '#models/link';
import FaviconEntry from '#models/favicon_entry';
import FaviconFailure from '#models/favicon_failure';
import { normalizeFaviconOrigin } from '#lib/favicons/favicon_origin';
import { FaviconStoreService } from '#services/favicons/favicon_store_service';

export type FaviconPurgeResult = {
	deletedEntries: number;
	deletedFiles: number;
	deletedFailures: number;
};

@inject()
export class FaviconOrphanPurgeService {
	constructor(private readonly store: FaviconStoreService) {}

	async purgeOrphans(): Promise<FaviconPurgeResult> {
		const referencedOrigins = await this.collectReferencedOrigins();
		const deletedEntries = await this.purgeOrphanedEntries(referencedOrigins);
		const deletedFiles = await this.purgeOrphanedFiles();
		const deletedFailures = await this.purgeOrphanedFailures(referencedOrigins);

		return { deletedEntries, deletedFiles, deletedFailures };
	}

	private async purgeOrphanedEntries(
		referencedOrigins: ReadonlySet<string>
	): Promise<number> {
		const query = FaviconEntry.query();
		if (referencedOrigins.size > 0) {
			query.whereNotIn('origin', [...referencedOrigins]);
		}
		const orphanedEntries = await query;

		for (const entry of orphanedEntries) {
			await entry.delete();
		}

		return orphanedEntries.length;
	}

	private async purgeOrphanedFailures(
		referencedOrigins: ReadonlySet<string>
	): Promise<number> {
		const query = FaviconFailure.query();
		if (referencedOrigins.size > 0) {
			query.whereNotIn('origin', [...referencedOrigins]);
		}

		const orphanedFailures = await query.select('id');
		await FaviconFailure.query()
			.whereIn(
				'id',
				orphanedFailures.map((failure) => failure.id)
			)
			.delete();

		return orphanedFailures.length;
	}

	private async purgeOrphanedFiles(): Promise<number> {
		const remainingEntries = await FaviconEntry.query().select('contentHash');
		const referencedHashes = new Set(
			remainingEntries.map((entry) => entry.contentHash)
		);

		const storedHashes = await this.store.listStoredHashes();
		const orphanedHashes = storedHashes.filter(
			(hash) => !referencedHashes.has(hash)
		);

		for (const hash of orphanedHashes) {
			await this.store.delete(hash);
		}

		return orphanedHashes.length;
	}

	private async collectReferencedOrigins(): Promise<Set<string>> {
		const links = await Link.query().select('url');
		return new Set(links.map((link) => normalizeFaviconOrigin(link.url)));
	}
}
