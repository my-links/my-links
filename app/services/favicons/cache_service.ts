import FaviconNotFoundException from '#exceptions/favicons/favicon_not_found_exception';
import { cache } from '#lib/cache';
import type { Favicon } from '#types/favicons/favicon_type';

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
			return favicon;
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
