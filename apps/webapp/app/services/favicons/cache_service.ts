import { cache } from '#lib/cache';
import type { Favicon } from '#types/favicon_type';
import UrlBlockedException from '#exceptions/favicons/url_blocked_exception';
import FaviconNotFoundException from '#exceptions/favicons/favicon_not_found_exception';

export class CacheService {
	private readonly cacheNs = cache.namespace('favicon');
	private readonly errorCacheNs = cache.namespace('favicon:error');
	private readonly errorTtl = '24h';
	private readonly successTtl = '7d';

	async getOrSetFavicon(
		url: string,
		factory: () => Promise<Favicon>
	): Promise<Favicon> {
		const normalizedKey = this.normalizeCacheKey(url);

		const cachedError = await this.errorCacheNs.get<string>({
			key: normalizedKey,
		});
		if (cachedError) {
			throw new FaviconNotFoundException(cachedError);
		}

		try {
			const favicon = await this.cacheNs.getOrSet({
				key: normalizedKey,
				ttl: this.successTtl,
				factory,
			});
			return this.withRealBuffer(favicon);
		} catch (error) {
			const originalError = this.unwrapFactoryError(error);
			const errorMessage =
				originalError instanceof Error
					? originalError.message
					: String(originalError);
			await this.errorCacheNs.set({
				key: normalizedKey,
				value: errorMessage,
				ttl: this.errorTtl,
			});
			throw originalError;
		}
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

	/**
	 * bentocache serializes even its in-memory L1 entries (`Buffer.byteLength`
	 * in its `memory` driver's `sizeCalculation` only makes sense against a
	 * string) — a cached `Favicon.buffer` round-trips through
	 * `JSON.stringify`/`JSON.parse` and comes back as `{ type: 'Buffer', data:
	 * [...] }`, not a real `Buffer`. `Buffer.from()` understands that exact
	 * shape and reconstructs the original bytes losslessly.
	 */
	private withRealBuffer(favicon: Favicon): Favicon {
		if (Buffer.isBuffer(favicon.buffer)) {
			return favicon;
		}
		return { ...favicon, buffer: Buffer.from(favicon.buffer) };
	}

	// A favicon is served per origin, not per URL: keying on the pathname too
	// meant every deep link to the same site re-scraped and re-cached
	// independently, multiplying the work by the number of links per domain.
	private normalizeCacheKey(url: string): string {
		try {
			const parsed = new URL(url);
			return `${parsed.protocol}//${parsed.hostname}`.toLowerCase();
		} catch {
			return url.toLowerCase();
		}
	}
}
