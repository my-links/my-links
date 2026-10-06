import { cache } from '#lib/cache';

const EPOCH_CACHE_KEY = 'current';

/** Version stamp embedded in every `/favicon` URL: bumping it is the only way to make browsers drop their cached favicons. */
export class FaviconEpochService {
	private readonly epochCacheNs = cache.namespace('favicon:epoch');

	async getEpoch(): Promise<number> {
		return (await this.epochCacheNs.get<number>({ key: EPOCH_CACHE_KEY })) ?? 0;
	}

	async bump(): Promise<void> {
		await this.epochCacheNs.set({ key: EPOCH_CACHE_KEY, value: Date.now() });
	}
}
