import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';

import type { Favicon } from '#types/favicon_type';
import { FaviconService } from '#services/favicons/favicons_service';
import { generateMonogram } from '#services/favicons/monogram_generator';
import { faviconFetchLimiter } from '#services/favicons/concurrency_limiter';
import {
	CacheService,
	type FaviconMetadata,
} from '#services/favicons/cache_service';

const STALE_AFTER_DAYS = 30;

export type FaviconResolver = Pick<
	FaviconService,
	'getFavicon' | 'checkForUpdate'
>;

export class FaviconResolutionService {
	constructor(
		private readonly cacheService: CacheService = new CacheService(),
		private readonly faviconService: FaviconResolver = new FaviconService()
	) {}

	async getFreshOrStale(url: string): Promise<Favicon> {
		const metadata = await this.cacheService.peekMetadata(url);
		if (!metadata) {
			void this.triggerResolution(url);
			return this.monogramFor(url);
		}

		if (!metadata.resolvedUrl) {
			void this.triggerResolution(url);
		} else if (this.isStale(metadata)) {
			void this.revalidate(url, metadata);
		}

		const buffer = await this.cacheService.readStoredBytes(metadata);
		if (!buffer) {
			void this.triggerResolution(url);
			return this.monogramFor(url);
		}

		return {
			buffer,
			type: metadata.contentType,
			size: metadata.byteSize,
			url: metadata.resolvedUrl ?? metadata.contentHash,
		};
	}

	// Terminal, not an error state: a link always shows something identifiable, never a broken image.
	private monogramFor(url: string): Favicon {
		const buffer = generateMonogram(url);
		return {
			buffer,
			type: 'image/svg+xml',
			size: buffer.length,
			url,
			isPlaceholder: true,
		};
	}

	async triggerResolution(url: string): Promise<void> {
		try {
			await this.cacheService.getOrSetFavicon(url, () =>
				faviconFetchLimiter.run(() => this.faviconService.getFavicon(url))
			);
		} catch (error) {
			logger.debug(`Background favicon resolution failed for ${url}`, error);
		}
	}

	/**
	 * A full re-scrape regardless of any existing entry — unlike
	 * `triggerResolution`, this never short-circuits on a prior result and
	 * lets the caller see a failure rather than swallowing it, since it always
	 * runs on behalf of someone waiting for the outcome (a user's manual
	 * refresh, or an admin re-resolving a known failure).
	 */
	async forceRefresh(url: string): Promise<Favicon> {
		return this.cacheService.forceResolve(url, () =>
			faviconFetchLimiter.run(() => this.faviconService.getFavicon(url))
		);
	}

	private async revalidate(
		url: string,
		metadata: FaviconMetadata
	): Promise<void> {
		const { resolvedUrl } = metadata;
		if (!resolvedUrl) {
			return;
		}

		try {
			const outcome = await faviconFetchLimiter.run(() =>
				this.faviconService.checkForUpdate(resolvedUrl, metadata)
			);
			await this.cacheService.markRevalidated(url, outcome);
		} catch (error) {
			logger.debug(`Favicon revalidation failed for ${url}`, error);
		}
	}

	private isStale(metadata: FaviconMetadata): boolean {
		if (!metadata.resolvedAt) {
			return true;
		}
		return (
			DateTime.fromMillis(metadata.resolvedAt) <
			DateTime.now().minus({ days: STALE_AFTER_DAYS })
		);
	}
}
