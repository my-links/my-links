import Link from '#models/link';
import FaviconEntry from '#models/favicon_entry';
import { normalizeFaviconOrigin } from '#services/favicons/favicon_origin';
import { FaviconStoreService } from '#services/favicons/favicon_store_service';

export type FaviconPurgeResult = {
	deletedEntries: number;
	deletedFiles: number;
};

export class FaviconOrphanPurgeService {
	constructor(
		private readonly store: FaviconStoreService = new FaviconStoreService()
	) {}

	async purgeOrphans(): Promise<FaviconPurgeResult> {
		const deletedEntries = await this.purgeOrphanedEntries();
		const deletedFiles = await this.purgeOrphanedFiles();

		return { deletedEntries, deletedFiles };
	}

	private async purgeOrphanedEntries(): Promise<number> {
		const referencedOrigins = await this.collectReferencedOrigins();

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
