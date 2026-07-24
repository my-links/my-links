import { cache } from '#lib/cache';
import type { Favicon } from '#types/favicon_type';
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
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			await this.errorCacheNs.set({
				key: normalizedKey,
				value: errorMessage,
				ttl: this.errorTtl,
			});
			throw error;
		}
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

	private normalizeCacheKey(url: string): string {
		try {
			const parsed = new URL(url);
			const normalized = `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;
			return normalized.replace(/\/$/, '').toLowerCase();
		} catch {
			return url.toLowerCase();
		}
	}
}
