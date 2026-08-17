import { cache } from '#lib/cache';
import FaviconEntry from '#models/favicon_entry';
import type { Favicon } from '#types/favicon_type';
import { normalizeFaviconOrigin } from '#services/favicons/favicon_origin';
import UrlBlockedException from '#exceptions/favicons/url_blocked_exception';
import { FaviconStoreService } from '#services/favicons/favicon_store_service';
import FaviconNotFoundException from '#exceptions/favicons/favicon_not_found_exception';

type FaviconMetadata = {
	contentHash: string;
	contentType: string;
	byteSize: number;
};

export class CacheService {
	private readonly metadataCacheNs = cache.namespace('favicon:meta');
	private readonly errorCacheNs = cache.namespace('favicon:error');
	private readonly errorTtl = '24h';
	private readonly successTtl = '7d';

	constructor(
		private readonly store: FaviconStoreService = new FaviconStoreService()
	) {}

	async getOrSetFavicon(
		url: string,
		factory: () => Promise<Favicon>
	): Promise<Favicon> {
		const origin = normalizeFaviconOrigin(url);

		const cachedError = await this.errorCacheNs.get<string>({ key: origin });
		if (cachedError) {
			throw new FaviconNotFoundException(cachedError);
		}

		try {
			const metadata = await this.metadataCacheNs.getOrSet({
				key: origin,
				ttl: this.successTtl,
				factory: () => this.resolveAndStore(origin, factory),
			});
			return await this.toFavicon(metadata);
		} catch (error) {
			const originalError = this.unwrapFactoryError(error);
			const errorMessage =
				originalError instanceof Error
					? originalError.message
					: String(originalError);
			await this.errorCacheNs.set({
				key: origin,
				value: errorMessage,
				ttl: this.errorTtl,
			});
			throw originalError;
		}
	}

	// Checks the durable row before the network: survives a restart, bentocache's memory driver doesn't.
	private async resolveAndStore(
		origin: string,
		factory: () => Promise<Favicon>
	): Promise<FaviconMetadata> {
		const existingEntry = await FaviconEntry.findBy('origin', origin);
		if (existingEntry) {
			return this.metadataFromEntry(existingEntry);
		}

		const favicon = await factory();
		const contentHash = await this.store.write(favicon.buffer);

		try {
			const entry = await FaviconEntry.create({
				origin,
				contentHash,
				contentType: favicon.type,
				byteSize: favicon.size,
				source: 'scraped',
			});
			return this.metadataFromEntry(entry);
		} catch (error) {
			// Two instances racing the same new origin: the loser hits the unique constraint, not a lost result.
			const raceWinner = await FaviconEntry.findBy('origin', origin);
			if (raceWinner) {
				return this.metadataFromEntry(raceWinner);
			}
			throw error;
		}
	}

	private metadataFromEntry(entry: FaviconEntry): FaviconMetadata {
		return {
			contentHash: entry.contentHash,
			contentType: entry.contentType,
			byteSize: entry.byteSize,
		};
	}

	private async toFavicon(metadata: FaviconMetadata): Promise<Favicon> {
		const buffer = await this.store.read(metadata.contentHash);
		if (!buffer) {
			throw new FaviconNotFoundException(
				`Stored favicon bytes missing for hash ${metadata.contentHash}`
			);
		}

		return {
			buffer,
			type: metadata.contentType,
			size: metadata.byteSize,
			url: metadata.contentHash,
		};
	}

	// bentocache wraps factory throws in `_FactoryError({ cause })`, breaking `instanceof` checks upstream.
	private unwrapFactoryError(error: unknown): unknown {
		if (
			error instanceof Error &&
			error.cause instanceof Error &&
			(error.cause instanceof FaviconNotFoundException ||
				error.cause instanceof UrlBlockedException)
		) {
			return error.cause;
		}
		return error;
	}
}
