import { cache } from '#lib/cache';
import { Favicon } from '#types/favicons/favicon_type';

export class CacheService {
	private cacheNs = cache.namespace('favicon');

	async getOrSetFavicon(
		url: string,
		factory: () => Promise<Favicon>
	): Promise<Favicon> {
		return this.cacheNs.getOrSet({
			key: url,
			ttl: '1h',
			factory,
		});
	}
}
