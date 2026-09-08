import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import { mkdtemp } from 'node:fs/promises';
import testUtils from '@adonisjs/core/services/test_utils';

import FaviconEntry from '#models/favicon_entry';
import type { Favicon } from '#types/favicon_type';
import FaviconFailure from '#models/favicon_failure';
import { CacheService } from '#services/favicons/cache_service';
import { FaviconEpochService } from '#services/favicons/favicon_epoch_service';
import { FaviconAdminService } from '#services/favicons/favicon_admin_service';
import { FaviconStoreService } from '#services/favicons/favicon_store_service';
import type { FaviconResolver } from '#services/favicons/favicon_resolution_service';
import { FaviconResolutionService } from '#services/favicons/favicon_resolution_service';

async function buildAdminService(
	resolver: FaviconResolver = {
		getFavicon: () => Promise.reject(new Error('not used in this test')),
		checkForUpdate: () => Promise.resolve({ changed: false }),
	}
): Promise<{ adminService: FaviconAdminService; store: FaviconStoreService }> {
	const storageDir = await mkdtemp(join(tmpdir(), 'favicon-admin-test-'));
	const store = new FaviconStoreService(storageDir);
	const cacheService = new CacheService(store);
	const resolutionService = new FaviconResolutionService(
		cacheService,
		resolver
	);
	return {
		adminService: new FaviconAdminService(store, resolutionService),
		store,
	};
}

async function createEntry(
	store: FaviconStoreService,
	origin: string,
	byteSize = 15
): Promise<FaviconEntry> {
	const hash = await store.write(Buffer.from(`bytes-for-${origin}`));
	return FaviconEntry.create({
		origin,
		contentHash: hash,
		contentType: 'image/x-icon',
		byteSize,
		source: 'scraped',
	});
}

function createFailure(origin: string): Promise<FaviconFailure> {
	return FaviconFailure.create({
		origin,
		reason: 'boom',
		failedAt: DateTime.now(),
	});
}

test.group('FaviconAdminService.getStats', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	// Deltas rather than absolute totals: the transaction wraps this test's
	// own writes, but the counts would otherwise also reflect whatever else
	// happens to be sitting in a developer's database.

	test('should count entries and sum their byte sizes', async ({ assert }) => {
		const { adminService, store } = await buildAdminService();
		const before = await adminService.getStats();

		await createEntry(store, 'https://stats-a.example', 10);
		await createEntry(store, 'https://stats-b.example', 25);

		const after = await adminService.getStats();

		assert.equal(after.entryCount, before.entryCount + 2);
		assert.equal(after.totalBytes, before.totalBytes + 35);
	});

	test('should count recorded failures', async ({ assert }) => {
		const { adminService } = await buildAdminService();
		const before = await adminService.getStats();

		await createFailure('https://stats-failure.example');

		const after = await adminService.getStats();

		assert.equal(after.failureCount, before.failureCount + 1);
	});
});

test.group('FaviconAdminService.flushAll', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should delete every stored entry, its bytes, and every failure row', async ({
		assert,
	}) => {
		const { adminService, store } = await buildAdminService();
		const entry = await createEntry(store, 'https://flush-me.example');
		await createFailure('https://flush-me-failure.example');

		await adminService.flushAll();

		assert.isNull(await FaviconEntry.find(entry.id));
		assert.isUndefined(await store.read(entry.contentHash));
		assert.lengthOf(await FaviconEntry.all(), 0);
		assert.lengthOf(await FaviconFailure.all(), 0);
	});

	test('should report how many entries it deleted', async ({ assert }) => {
		const { adminService, store } = await buildAdminService();
		const before = (await adminService.getStats()).entryCount;
		await createEntry(store, 'https://flush-count-a.example');
		await createEntry(store, 'https://flush-count-b.example');

		const result = await adminService.flushAll();

		assert.equal(result.deletedEntries, before + 2);
	});

	test("should bump the favicon epoch so a browser's cached images go stale", async ({
		assert,
	}) => {
		const { adminService } = await buildAdminService();
		const epochService = new FaviconEpochService();
		const before = await epochService.getEpoch();

		await adminService.flushAll();

		assert.notEqual(await epochService.getEpoch(), before);
	});
});

test.group('FaviconAdminService.reResolveFailures', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should re-resolve every failing origin and clear its failure on success', async ({
		assert,
	}) => {
		const origin = 'https://reresolve-success.example';
		const favicon: Favicon = {
			buffer: Buffer.from('fresh-bytes'),
			url: origin,
			type: 'image/x-icon',
			size: 11,
		};
		const { adminService } = await buildAdminService({
			getFavicon: () => Promise.resolve(favicon),
			checkForUpdate: () => Promise.resolve({ changed: false }),
		});
		await createFailure(origin);

		const result = await adminService.reResolveFailures();

		assert.equal(result.attempted, 1);
		assert.equal(result.succeeded, 1);
		assert.isNull(await FaviconFailure.findBy('origin', origin));
	});

	test('should leave a failure recorded when the retry fails again', async ({
		assert,
	}) => {
		const origin = 'https://reresolve-failure.example';
		const { adminService } = await buildAdminService({
			getFavicon: () => Promise.reject(new Error('still broken')),
			checkForUpdate: () => Promise.resolve({ changed: false }),
		});
		await createFailure(origin);

		const result = await adminService.reResolveFailures();

		assert.equal(result.attempted, 1);
		assert.equal(result.succeeded, 0);
		assert.isNotNull(await FaviconFailure.findBy('origin', origin));
	});

	test('should bump the favicon epoch when a retry actually succeeds', async ({
		assert,
	}) => {
		const origin = 'https://reresolve-epoch-bump.example';
		const { adminService } = await buildAdminService({
			getFavicon: () =>
				Promise.resolve({
					buffer: Buffer.from('fresh-bytes'),
					url: origin,
					type: 'image/x-icon',
					size: 11,
				}),
			checkForUpdate: () => Promise.resolve({ changed: false }),
		});
		const epochService = new FaviconEpochService();
		const before = await epochService.getEpoch();
		await createFailure(origin);

		await adminService.reResolveFailures();

		assert.notEqual(await epochService.getEpoch(), before);
	});

	test('should not bump the favicon epoch when nothing succeeds', async ({
		assert,
	}) => {
		const origin = 'https://reresolve-no-epoch-bump.example';
		const { adminService } = await buildAdminService({
			getFavicon: () => Promise.reject(new Error('still broken')),
			checkForUpdate: () => Promise.resolve({ changed: false }),
		});
		const epochService = new FaviconEpochService();
		const before = await epochService.getEpoch();
		await createFailure(origin);

		await adminService.reResolveFailures();

		assert.equal(await epochService.getEpoch(), before);
	});
});

test.group('FaviconAdminService.reResolveAll', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	// A shared dev DB can already carry real favicon_entries outside this
	// test's transaction (see the note on `FaviconOrphanPurgeService` above),
	// and `reResolveAll` deliberately re-scrapes everything — so assertions
	// track calls made for this test's own origin, never the raw totals.

	test('should re-scrape every resolved entry, not only failing ones', async ({
		assert,
	}) => {
		const origin = 'https://reresolve-all-entry.example';
		const calledOrigins: string[] = [];
		const { adminService, store } = await buildAdminService({
			getFavicon: (url) => {
				calledOrigins.push(url);
				return Promise.resolve({
					buffer: Buffer.from('fresh-bytes'),
					url,
					type: 'image/x-icon',
					size: 11,
				});
			},
			checkForUpdate: () => Promise.resolve({ changed: false }),
		});
		await createEntry(store, origin);

		const result = await adminService.reResolveAll();

		assert.include(calledOrigins, origin);
		assert.isAtLeast(result.succeeded, 1);
	});

	test('should bump the favicon epoch when at least one origin actually resolves', async ({
		assert,
	}) => {
		const origin = 'https://reresolve-all-epoch-bump.example';
		const { adminService, store } = await buildAdminService({
			getFavicon: () =>
				Promise.resolve({
					buffer: Buffer.from('fresh-bytes'),
					url: origin,
					type: 'image/x-icon',
					size: 11,
				}),
			checkForUpdate: () => Promise.resolve({ changed: false }),
		});
		const epochService = new FaviconEpochService();
		const before = await epochService.getEpoch();
		await createEntry(store, origin);

		await adminService.reResolveAll();

		assert.notEqual(await epochService.getEpoch(), before);
	});

	test('should also include origins that only have a recorded failure', async ({
		assert,
	}) => {
		const origin = 'https://reresolve-all-failure-only.example';
		const calledOrigins: string[] = [];
		const { adminService } = await buildAdminService({
			getFavicon: (url) => {
				calledOrigins.push(url);
				return Promise.reject(new Error('still broken'));
			},
			checkForUpdate: () => Promise.resolve({ changed: false }),
		});
		await createFailure(origin);

		await adminService.reResolveAll();

		assert.include(calledOrigins, origin);
	});

	test('should not attempt the same origin twice when it has both an entry and a failure', async ({
		assert,
	}) => {
		const origin = 'https://reresolve-all-dedup.example';
		const calledOrigins: string[] = [];
		const { adminService, store } = await buildAdminService({
			getFavicon: (url) => {
				calledOrigins.push(url);
				return Promise.resolve({
					buffer: Buffer.from('fresh-bytes'),
					url,
					type: 'image/x-icon',
					size: 11,
				});
			},
			checkForUpdate: () => Promise.resolve({ changed: false }),
		});
		await createEntry(store, origin);
		await createFailure(origin);

		await adminService.reResolveAll();

		const callsForOrigin = calledOrigins.filter(
			(calledOrigin) => calledOrigin === origin
		);
		assert.lengthOf(callsForOrigin, 1);
	});
});
