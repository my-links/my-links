import { test } from '@japa/runner';

import { cache } from '#lib/cache';
import type { Favicon } from '#types/favicon_type';
import { CacheService } from '#services/favicons/cache_service';

function normalizeCacheKeyLikeCacheService(url: string): string {
	const parsed = new URL(url);
	return `${parsed.protocol}//${parsed.hostname}`.toLowerCase();
}

test.group('CacheService.getOrSetFavicon', () => {
	test('should return a real Buffer even when the cached entry lost its Buffer prototype', async ({
		assert,
	}) => {
		const cacheService = new CacheService();
		const url = `https://cache-service-test-${Date.now()}.example`;
		const realFavicon: Favicon = {
			buffer: Buffer.from('fake-icon-bytes'),
			url,
			type: 'image/x-icon',
			size: 15,
		};

		// Simulates exactly what bentocache's JSON round-trip does to a
		// cached `Buffer` field — see `CacheService.withRealBuffer`'s docstring.
		const corruptedFavicon = JSON.parse(JSON.stringify(realFavicon));
		await cache.namespace('favicon').set({
			key: normalizeCacheKeyLikeCacheService(url),
			value: corruptedFavicon,
			ttl: '7d',
		});

		const favicon = await cacheService.getOrSetFavicon(url, () => {
			throw new Error('factory should not run on a cache hit');
		});

		assert.isTrue(Buffer.isBuffer(favicon.buffer));
		assert.isTrue(favicon.buffer.equals(realFavicon.buffer));
	});

	test('should share one cache entry across different paths on the same origin', async ({
		assert,
	}) => {
		const cacheService = new CacheService();
		const origin = `https://cache-service-origin-test-${Date.now()}.example`;
		let factoryCallCount = 0;

		const factory = () => {
			factoryCallCount += 1;
			return Promise.resolve<Favicon>({
				buffer: Buffer.from('fake-icon-bytes'),
				url: origin,
				type: 'image/x-icon',
				size: 15,
			});
		};

		await cacheService.getOrSetFavicon(`${origin}/first/deep/link`, factory);
		await cacheService.getOrSetFavicon(`${origin}/second/other/link`, factory);

		assert.equal(factoryCallCount, 1);
	});
});
