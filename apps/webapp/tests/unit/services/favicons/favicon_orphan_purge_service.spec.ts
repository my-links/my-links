import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from '@japa/runner';
import { mkdtemp } from 'node:fs/promises';
import testUtils from '@adonisjs/core/services/test_utils';

import FaviconEntry from '#models/favicon_entry';
import { createLink } from '#tests/factories/link_factory';
import { createUser } from '#tests/factories/user_factory';
import { FaviconStoreService } from '#services/favicons/favicon_store_service';
import { FaviconOrphanPurgeService } from '#services/favicons/favicon_orphan_purge_service';

async function buildPurgeService(): Promise<{
	purgeService: FaviconOrphanPurgeService;
	store: FaviconStoreService;
}> {
	const storageDir = await mkdtemp(join(tmpdir(), 'favicon-purge-test-'));
	const store = new FaviconStoreService(storageDir);
	return { purgeService: new FaviconOrphanPurgeService(store), store };
}

async function createEntry(
	store: FaviconStoreService,
	origin: string
): Promise<FaviconEntry> {
	const hash = await store.write(Buffer.from(`bytes-for-${origin}`));
	return FaviconEntry.create({
		origin,
		contentHash: hash,
		contentType: 'image/x-icon',
		byteSize: 15,
		source: 'scraped',
	});
}

test.group('FaviconOrphanPurgeService.purgeOrphans', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	// Assertions target the specific rows/files each test creates rather than
	// the aggregate counts in the result: the transaction wraps this test's
	// own writes, but the counts would otherwise also reflect whatever else
	// happens to be sitting in a developer's database.

	test('should keep entries whose origin still has a link', async ({
		assert,
	}) => {
		const { purgeService, store } = await buildPurgeService();
		const user = await createUser({ emailPrefix: 'favicon-purge-keep' });
		await createLink({ author: user, url: 'https://kept.example/some/page' });
		const entry = await createEntry(store, 'https://kept.example');

		await purgeService.purgeOrphans();

		assert.isNotNull(await FaviconEntry.find(entry.id));
	});

	test('should delete entries whose origin no link references anymore', async ({
		assert,
	}) => {
		const { purgeService, store } = await buildPurgeService();
		const entry = await createEntry(store, 'https://orphaned.example');

		await purgeService.purgeOrphans();

		assert.isNull(await FaviconEntry.find(entry.id));
	});

	test('should delete the on-disk bytes of an orphaned entry', async ({
		assert,
	}) => {
		const { purgeService, store } = await buildPurgeService();
		const entry = await createEntry(store, 'https://orphaned-bytes.example');

		await purgeService.purgeOrphans();

		assert.isUndefined(await store.read(entry.contentHash));
	});

	test('should keep a stored file whose hash is still referenced by another entry', async ({
		assert,
	}) => {
		const { purgeService, store } = await buildPurgeService();
		const user = await createUser({ emailPrefix: 'favicon-purge-shared-hash' });
		await createLink({ author: user, url: 'https://kept-shared.example/' });
		const sharedHash = await store.write(Buffer.from('shared-bytes'));

		const keptEntry = await FaviconEntry.create({
			origin: 'https://kept-shared.example',
			contentHash: sharedHash,
			contentType: 'image/x-icon',
			byteSize: 12,
			source: 'scraped',
		});
		const orphanedEntry = await FaviconEntry.create({
			origin: 'https://orphaned-shared.example',
			contentHash: sharedHash,
			contentType: 'image/x-icon',
			byteSize: 12,
			source: 'scraped',
		});

		await purgeService.purgeOrphans();

		assert.isNotNull(await FaviconEntry.find(keptEntry.id));
		assert.isNull(await FaviconEntry.find(orphanedEntry.id));
		assert.isDefined(await store.read(sharedHash));
	});
});
