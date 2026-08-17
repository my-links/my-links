import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from '@japa/runner';
import { createHash } from 'node:crypto';
import { mkdtemp, writeFile } from 'node:fs/promises';

import { FaviconStoreService } from '#services/favicons/favicon_store_service';

async function buildStore(): Promise<FaviconStoreService> {
	const storageDir = await mkdtemp(join(tmpdir(), 'favicon-store-test-'));
	return new FaviconStoreService(storageDir);
}

test.group('FaviconStoreService', () => {
	test('should read back exactly what was written, keyed by its sha256 hash', async ({
		assert,
	}) => {
		const store = await buildStore();
		const buffer = Buffer.from('fake-icon-bytes');

		const hash = await store.write(buffer);

		assert.equal(hash, createHash('sha256').update(buffer).digest('hex'));
		const readBack = await store.read(hash);
		assert.isTrue(readBack?.equals(buffer));
	});

	test('should return undefined for a hash that was never written', async ({
		assert,
	}) => {
		const store = await buildStore();

		const readBack = await store.read('a'.repeat(64));

		assert.isUndefined(readBack);
	});

	test('should deduplicate identical bytes under the same hash', async ({
		assert,
	}) => {
		const store = await buildStore();
		const buffer = Buffer.from('same-bytes-everywhere');

		const firstHash = await store.write(buffer);
		const secondHash = await store.write(buffer);

		assert.equal(firstHash, secondHash);
	});

	test('should make a deleted hash unreadable, and tolerate deleting it twice', async ({
		assert,
	}) => {
		const store = await buildStore();
		const hash = await store.write(Buffer.from('to-be-deleted'));

		await store.delete(hash);
		await store.delete(hash);

		assert.isUndefined(await store.read(hash));
	});

	test('should list only hash-shaped filenames, ignoring anything else in the storage dir', async ({
		assert,
	}) => {
		const storageDir = await mkdtemp(join(tmpdir(), 'favicon-store-test-'));
		const store = new FaviconStoreService(storageDir);
		const hash = await store.write(Buffer.from('listed-file'));
		await writeFile(join(storageDir, 'not-a-hash.txt'), 'junk');

		const listed = await store.listStoredHashes();

		assert.deepEqual(listed, [hash]);
	});

	test('should return an empty list when the storage dir does not exist yet', async ({
		assert,
	}) => {
		const storageDir = join(
			tmpdir(),
			`favicon-store-test-missing-${Date.now()}`
		);
		const store = new FaviconStoreService(storageDir);

		assert.deepEqual(await store.listStoredHashes(), []);
	});

	test('should reject reading a value that is not a valid sha256 hash', async ({
		assert,
	}) => {
		const store = await buildStore();

		await assert.rejects(() => store.read('../../etc/passwd'));
	});
});
