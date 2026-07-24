import { test } from '@japa/runner';

import { cache } from '#lib/cache';
import type { Favicon } from '#types/favicon_type';
import { CacheService } from '#services/favicons/cache_service';

function normalizeCacheKeyLikeCacheService(url: string): string {
	const parsed = new URL(url);
	return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`
		.replace(/\/$/, '')
		.toLowerCase();
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
});
