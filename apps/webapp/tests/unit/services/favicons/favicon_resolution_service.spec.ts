import { DateTime } from 'luxon';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from '@japa/runner';
import { mkdtemp } from 'node:fs/promises';
import testUtils from '@adonisjs/core/services/test_utils';

import FaviconEntry from '#models/favicon_entry';
import type { Favicon } from '#types/favicon_type';
import { CacheService } from '#services/favicons/cache_service';
import { normalizeFaviconOrigin } from '#services/favicons/favicon_origin';
import { FaviconStoreService } from '#services/favicons/favicon_store_service';
import {
	FaviconResolutionService,
	type FaviconResolver,
} from '#services/favicons/favicon_resolution_service';

function fakeFavicon(url: string): Favicon {
	return {
		buffer: Buffer.from(`fake-icon-bytes-${url}`),
		url,
		type: 'image/x-icon',
		size: 15,
	};
}

type FakeResolver = FaviconResolver & { getFaviconCallCount: number };

function buildFakeResolver(favicon: Favicon): FakeResolver {
	const resolver: FakeResolver = {
		getFaviconCallCount: 0,
		getFavicon: () => {
			resolver.getFaviconCallCount += 1;
			return Promise.resolve(favicon);
		},
		checkForUpdate: () => Promise.resolve({ changed: false }),
	};
	return resolver;
}

async function buildService(favicon: Favicon) {
	const storageDir = await mkdtemp(join(tmpdir(), 'favicon-resolution-test-'));
	const cacheService = new CacheService(new FaviconStoreService(storageDir));
	const resolver = buildFakeResolver(favicon);
	const service = new FaviconResolutionService(cacheService, resolver);
	return { service, resolver };
}

test.group('FaviconResolutionService.triggerResolution', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should resolve and store a favicon that has never been seen', async ({
		assert,
	}) => {
		const url = `https://resolution-trigger-test-${Date.now()}.example`;
		const { service, resolver } = await buildService(fakeFavicon(url));

		await service.triggerResolution(url);

		assert.equal(resolver.getFaviconCallCount, 1);
		const favicon = await service.getFreshOrStale(url);
		assert.isDefined(favicon);
	});

	test('should not resolve again once an entry already exists for the origin', async ({
		assert,
	}) => {
		const url = `https://resolution-trigger-dedup-test-${Date.now()}.example`;
		const { service, resolver } = await buildService(fakeFavicon(url));

		await service.triggerResolution(url);
		await service.triggerResolution(url);

		assert.equal(resolver.getFaviconCallCount, 1);
	});
});

test.group('FaviconResolutionService.getFreshOrStale', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should return a monogram when nothing is stored yet', async ({
		assert,
	}) => {
		const url = `https://get-fresh-missing-test-${Date.now()}.example`;
		const { service } = await buildService(fakeFavicon(url));

		const favicon = await service.getFreshOrStale(url);

		assert.equal(favicon.type, 'image/svg+xml');
	});

	test('should return the stored bytes once a resolution has completed', async ({
		assert,
	}) => {
		const url = `https://get-fresh-resolved-test-${Date.now()}.example`;
		const favicon = fakeFavicon(url);
		const { service } = await buildService(favicon);

		await service.triggerResolution(url);
		const result = await service.getFreshOrStale(url);

		assert.isTrue(result.buffer.equals(favicon.buffer));
	});

	test('should serve a fresh entry without checking for updates', async ({
		assert,
	}) => {
		const url = `https://get-fresh-not-stale-test-${Date.now()}.example`;
		const favicon = fakeFavicon(url);
		const { service, resolver } = await buildService(favicon);
		await service.triggerResolution(url);

		let checkForUpdateCallCount = 0;
		resolver.checkForUpdate = () => {
			checkForUpdateCallCount += 1;
			return Promise.resolve({ changed: false } as const);
		};

		await service.getFreshOrStale(url);

		assert.equal(checkForUpdateCallCount, 0);
	});

	test('should still serve the stored bytes immediately when the entry is stale', async ({
		assert,
	}) => {
		const url = `https://get-fresh-stale-test-${Date.now()}.example`;
		const favicon = fakeFavicon(url);
		const { service } = await buildService(favicon);
		await service.triggerResolution(url);

		const entry = await FaviconEntry.findByOrFail(
			'origin',
			normalizeFaviconOrigin(url)
		);
		entry.resolvedAt = DateTime.now().minus({ days: 31 });
		await entry.save();

		const result = await service.getFreshOrStale(url);

		assert.isTrue(result.buffer.equals(favicon.buffer));
	});

	test('should return a monogram rather than fail when resolution keeps failing', async ({
		assert,
	}) => {
		const url = `https://get-fresh-unresolvable-test-${Date.now()}.example`;
		const storageDir = await mkdtemp(
			join(tmpdir(), 'favicon-resolution-test-')
		);
		const cacheService = new CacheService(new FaviconStoreService(storageDir));
		const alwaysFailingResolver: FaviconResolver = {
			getFavicon: () => Promise.reject(new Error('no favicon here')),
			checkForUpdate: () => Promise.resolve({ changed: false }),
		};
		const service = new FaviconResolutionService(
			cacheService,
			alwaysFailingResolver
		);

		const favicon = await service.getFreshOrStale(url);

		assert.equal(favicon.type, 'image/svg+xml');
	});
});
