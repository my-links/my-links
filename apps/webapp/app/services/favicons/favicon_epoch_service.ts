import { cache } from '#lib/cache';

const EPOCH_CACHE_KEY = 'current';

/**
 * A version stamp for the favicon store as a whole, embedded in every
 * `/favicon` URL the client builds. Bumping it changes every one of those
 * URLs at once, which is the only way to make a browser drop favicons it
 * already cached for a week — deleting the server-side rows does nothing to
 * a cache the browser never re-asks about.
 */
export class FaviconEpochService {
	private readonly epochCacheNs = cache.namespace('favicon:epoch');

	async getEpoch(): Promise<number> {
		return (await this.epochCacheNs.get<number>({ key: EPOCH_CACHE_KEY })) ?? 0;
	}

	async bump(): Promise<void> {
		await this.epochCacheNs.set({ key: EPOCH_CACHE_KEY, value: Date.now() });
	}
}
