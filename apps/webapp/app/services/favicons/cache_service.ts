import { DateTime } from 'luxon';

import { cache } from '#lib/cache';
import FaviconEntry from '#models/favicon_entry';
import type { Favicon } from '#types/favicon_type';
import { normalizeFaviconOrigin } from '#services/favicons/favicon_origin';
import UrlBlockedException from '#exceptions/favicons/url_blocked_exception';
import { FaviconStoreService } from '#services/favicons/favicon_store_service';
import FaviconNotFoundException from '#exceptions/favicons/favicon_not_found_exception';

export type FaviconMetadata = {
	contentHash: string;
	contentType: string;
	byteSize: number;
	resolvedUrl: string | null;
	resolvedAt: number | null;
	etag: string | null;
	lastModified: string | null;
};

export type FaviconRevalidationOutcome =
	| { changed: false }
	| { changed: true; favicon: Favicon };

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

	async peekMetadata(url: string): Promise<FaviconMetadata | undefined> {
		const origin = normalizeFaviconOrigin(url);

		const cached = await this.metadataCacheNs.get<FaviconMetadata>({
			key: origin,
		});
		if (cached) {
			return cached;
		}

		const entry = await FaviconEntry.findBy('origin', origin);
		if (!entry) {
			return undefined;
		}

		const metadata = this.metadataFromEntry(entry);
		await this.metadataCacheNs.set({
			key: origin,
			value: metadata,
			ttl: this.successTtl,
		});
		return metadata;
	}

	async readStoredBytes(
		metadata: FaviconMetadata
	): Promise<Buffer | undefined> {
		return this.store.read(metadata.contentHash);
	}

	async markRevalidated(
		url: string,
		outcome: FaviconRevalidationOutcome
	): Promise<void> {
		const origin = normalizeFaviconOrigin(url);
		const entry = await FaviconEntry.findBy('origin', origin);
		if (!entry) {
			return;
		}

		if (outcome.changed) {
			const contentHash = await this.store.write(outcome.favicon.buffer);
			entry.merge({
				contentHash,
				contentType: outcome.favicon.type,
				byteSize: outcome.favicon.size,
				resolvedUrl: this.resolvedUrlOf(outcome.favicon),
				etag: outcome.favicon.etag ?? null,
				lastModified: outcome.favicon.lastModified ?? null,
			});
		}

		entry.resolvedAt = DateTime.now();
		await entry.save();

		await this.metadataCacheNs.set({
			key: origin,
			value: this.metadataFromEntry(entry),
			ttl: this.successTtl,
		});
	}

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
				resolvedUrl: this.resolvedUrlOf(favicon),
				resolvedAt: DateTime.now(),
				etag: favicon.etag ?? null,
				lastModified: favicon.lastModified ?? null,
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

	// Inline data: URIs aren't a network resource to revalidate against.
	private resolvedUrlOf(favicon: Favicon): string | null {
		return favicon.url.startsWith('data:') ? null : favicon.url;
	}

	private metadataFromEntry(entry: FaviconEntry): FaviconMetadata {
		return {
			contentHash: entry.contentHash,
			contentType: entry.contentType,
			byteSize: entry.byteSize,
			resolvedUrl: entry.resolvedUrl,
			resolvedAt: entry.resolvedAt ? entry.resolvedAt.toMillis() : null,
			etag: entry.etag,
			lastModified: entry.lastModified,
		};
	}

	private async toFavicon(metadata: FaviconMetadata): Promise<Favicon> {
		const buffer = await this.readStoredBytes(metadata);
		if (!buffer) {
			throw new FaviconNotFoundException(
				`Stored favicon bytes missing for hash ${metadata.contentHash}`
			);
		}

		return {
			buffer,
			type: metadata.contentType,
			size: metadata.byteSize,
			url: metadata.resolvedUrl ?? metadata.contentHash,
			etag: metadata.etag,
			lastModified: metadata.lastModified,
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
