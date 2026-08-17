import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from '@japa/runner';
import { mkdtemp } from 'node:fs/promises';
import testUtils from '@adonisjs/core/services/test_utils';

import { cache } from '#lib/cache';
import type { Favicon } from '#types/favicon_type';
import { CacheService } from '#services/favicons/cache_service';
import { normalizeFaviconOrigin } from '#services/favicons/favicon_origin';
import { FaviconStoreService } from '#services/favicons/favicon_store_service';

async function buildCacheService(): Promise<CacheService> {
	const storageDir = await mkdtemp(
		join(tmpdir(), 'favicon-cache-service-test-')
	);
	return new CacheService(new FaviconStoreService(storageDir));
}

function fakeFavicon(url: string): Favicon {
	return {
		buffer: Buffer.from(`fake-icon-bytes-${url}`),
		url,
		type: 'image/x-icon',
		size: 15,
	};
}

test.group('CacheService.getOrSetFavicon', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should serve the stored bytes back on a cache hit without re-running the factory', async ({
		assert,
	}) => {
		const cacheService = await buildCacheService();
		const url = `https://cache-service-test-${Date.now()}.example`;
		const original = fakeFavicon(url);

		const first = await cacheService.getOrSetFavicon(url, () =>
			Promise.resolve(original)
		);
		const second = await cacheService.getOrSetFavicon(url, () => {
			throw new Error('factory should not run on a cache hit');
		});

		assert.isTrue(first.buffer.equals(original.buffer));
		assert.isTrue(second.buffer.equals(original.buffer));
		assert.equal(second.type, original.type);
		assert.equal(second.size, original.size);
	});

	test('should share one cache entry across different paths on the same origin', async ({
		assert,
	}) => {
		const cacheService = await buildCacheService();
		const origin = `https://cache-service-origin-test-${Date.now()}.example`;
		let factoryCallCount = 0;

		const factory = () => {
			factoryCallCount += 1;
			return Promise.resolve(fakeFavicon(origin));
		};

		await cacheService.getOrSetFavicon(`${origin}/first/deep/link`, factory);
		await cacheService.getOrSetFavicon(`${origin}/second/other/link`, factory);

		assert.equal(factoryCallCount, 1);
	});

	test('should serve from the durable store without the network factory after the in-memory cache is evicted', async ({
		assert,
	}) => {
		// Simulates what a process restart does to bentocache's memory-only L1:
		// the metadata cache entry is gone, but the favicon_entries row and the
		// on-disk bytes survive — that durability is the whole point of the
		// content-addressed store.
		const cacheService = await buildCacheService();
		const url = `https://cache-service-cold-cache-test-${Date.now()}.example`;
		const original = fakeFavicon(url);

		await cacheService.getOrSetFavicon(url, () => Promise.resolve(original));
		await cache
			.namespace('favicon:meta')
			.delete({ key: normalizeFaviconOrigin(url) });

		const afterEviction = await cacheService.getOrSetFavicon(url, () => {
			throw new Error('factory should not run once the durable row exists');
		});

		assert.isTrue(afterEviction.buffer.equals(original.buffer));
	});
});

test.group('CacheService.peekMetadata', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should return undefined when nothing has ever been resolved', async ({
		assert,
	}) => {
		const cacheService = await buildCacheService();
		const url = `https://peek-metadata-missing-test-${Date.now()}.example`;

		assert.isUndefined(await cacheService.peekMetadata(url));
	});

	test('should return the metadata of a resolved favicon, including its validators', async ({
		assert,
	}) => {
		const cacheService = await buildCacheService();
		const url = `https://peek-metadata-test-${Date.now()}.example`;
		const original: Favicon = {
			...fakeFavicon(url),
			etag: '"abc123"',
			lastModified: 'Wed, 21 Oct 2015 07:28:00 GMT',
		};

		await cacheService.getOrSetFavicon(url, () => Promise.resolve(original));
		const metadata = await cacheService.peekMetadata(url);

		assert.equal(metadata?.resolvedUrl, url);
		assert.equal(metadata?.etag, original.etag);
		assert.equal(metadata?.lastModified, original.lastModified);
		assert.isNumber(metadata?.resolvedAt);
	});
});

test.group('CacheService.markRevalidated', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should bump resolvedAt without touching the stored bytes when unchanged', async ({
		assert,
	}) => {
		const cacheService = await buildCacheService();
		const url = `https://mark-revalidated-unchanged-test-${Date.now()}.example`;
		const original = fakeFavicon(url);

		await cacheService.getOrSetFavicon(url, () => Promise.resolve(original));
		const before = await cacheService.peekMetadata(url);

		await cacheService.markRevalidated(url, { changed: false });
		await cache
			.namespace('favicon:meta')
			.delete({ key: normalizeFaviconOrigin(url) });
		const after = await cacheService.peekMetadata(url);

		assert.equal(after?.contentHash, before?.contentHash);
		assert.isTrue((after?.resolvedAt ?? 0) >= (before?.resolvedAt ?? 0));
	});

	test('should replace the stored bytes and validators when changed', async ({
		assert,
	}) => {
		const cacheService = await buildCacheService();
		const url = `https://mark-revalidated-changed-test-${Date.now()}.example`;
		const original = fakeFavicon(url);
		await cacheService.getOrSetFavicon(url, () => Promise.resolve(original));

		const updated: Favicon = {
			buffer: Buffer.from('brand-new-icon-bytes'),
			url,
			type: 'image/png',
			size: 21,
			etag: '"new-etag"',
			lastModified: 'Thu, 22 Oct 2015 07:28:00 GMT',
		};
		await cacheService.markRevalidated(url, {
			changed: true,
			favicon: updated,
		});

		const refreshed = await cacheService.getOrSetFavicon(url, () => {
			throw new Error('factory should not run: an entry already exists');
		});

		assert.isTrue(refreshed.buffer.equals(updated.buffer));
		assert.equal(refreshed.type, updated.type);
		assert.equal(refreshed.etag, updated.etag);
		assert.equal(refreshed.lastModified, updated.lastModified);
	});

	test('should do nothing when the entry no longer exists', async ({
		assert,
	}) => {
		const cacheService = await buildCacheService();
		const url = `https://mark-revalidated-missing-test-${Date.now()}.example`;

		await cacheService.markRevalidated(url, { changed: false });

		assert.isUndefined(await cacheService.peekMetadata(url));
	});
});
