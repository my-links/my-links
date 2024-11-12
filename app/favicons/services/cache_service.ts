import { cache } from '#core/lib/cache';
import { Favicon } from '#favicons/types/favicon_type';

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
