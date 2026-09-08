import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import FaviconEntry from '#models/favicon_entry';
import { createUser } from '#tests/factories/user_factory';
import { FaviconStoreService } from '#services/favicons/favicon_store_service';
import { FaviconResolutionService } from '#services/favicons/favicon_resolution_service';

const FAVORITES_ROUTE = '/collections/favorites';

async function createAdmin(prefix = 'favicon-admin'): Promise<User> {
	const user = await createUser({ emailPrefix: prefix });
	user.isAdmin = true;
	await user.save();

	return user;
}

async function createOrphanedEntry(origin: string): Promise<FaviconEntry> {
	const store = new FaviconStoreService();
	const hash = await store.write(Buffer.from(`bytes-for-${origin}`));
	return FaviconEntry.create({
		origin,
		contentHash: hash,
		contentType: 'image/x-icon',
		byteSize: 15,
		source: 'scraped',
	});
}

test.group('Admin favicons page', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should reject a non-administrator', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'favicon-admin-refused' });

		const response = await client
			.get('/admin/favicons')
			.loginAs(user)
			.redirects(0);

		response.assertHeader('location', FAVORITES_ROUTE);
	});

	test('should render aggregate stats for an administrator', async ({
		client,
		assert,
	}) => {
		const admin = await createAdmin();
		const entry = await createOrphanedEntry('https://admin-stats-page.example');

		const response = await client
			.get('/admin/favicons')
			.withInertia()
			.loginAs(admin);

		response.assertStatus(200);
		response.assertInertiaComponent('admin/favicons');
		assert.isAtLeast(response.inertiaProps?.entryCount, 1);
		assert.isAtLeast(response.inertiaProps?.totalBytes, entry.byteSize);
	});
});

test.group('Admin favicon mass actions', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should purge orphaned entries and flash a summary', async ({
		client,
		assert,
	}) => {
		const admin = await createAdmin('favicon-admin-purge');
		const entry = await createOrphanedEntry(
			'https://admin-purge-orphan.example'
		);

		const response = await client
			.post('/admin/favicons/purge-orphans')
			.withCsrfToken()
			.loginAs(admin)
			.redirects(0);

		response.assertStatus(302);
		assert.isNull(await FaviconEntry.find(entry.id));
	});

	test('should flush the entire store and flash a summary', async ({
		client,
		assert,
	}) => {
		const admin = await createAdmin('favicon-admin-flush');
		const entry = await createOrphanedEntry('https://admin-flush.example');

		const response = await client
			.post('/admin/favicons/flush')
			.withCsrfToken()
			.loginAs(admin)
			.redirects(0);

		response.assertStatus(302);
		assert.isNull(await FaviconEntry.find(entry.id));
	});

	test('should report nothing to re-resolve when there is no recorded failure', async ({
		client,
	}) => {
		const admin = await createAdmin('favicon-admin-reresolve');

		const response = await client
			.post('/admin/favicons/reresolve-failures')
			.withCsrfToken()
			.loginAs(admin)
			.redirects(0);

		response.assertStatus(302);
		response.assertFlashMessage(
			'success',
			'Re-resolved 0 of 0 failing favicon(s)'
		);
	});

	test('should re-scrape every known origin and redirect back', async ({
		client,
	}) => {
		// Swapped rather than left real: a developer's DB can already carry
		// real entries outside this test's transaction (see the note on
		// `FaviconOrphanPurgeService.purgeOrphans` above), and re-resolving
		// those for real here would mean live network calls in the test suite.
		app.container.swap(
			FaviconResolutionService,
			() =>
				({
					getFreshOrStale: () => Promise.reject(new Error('not used')),
					triggerResolution: () => Promise.resolve(),
					forceRefresh: () =>
						Promise.resolve({
							buffer: Buffer.from('fresh-bytes'),
							url: 'https://irrelevant.example',
							type: 'image/x-icon',
							size: 11,
						}),
				}) as unknown as FaviconResolutionService
		);
		const admin = await createAdmin('favicon-admin-reresolve-all');

		const response = await client
			.post('/admin/favicons/reresolve-all')
			.withCsrfToken()
			.loginAs(admin)
			.redirects(0);

		response.assertStatus(302);
	}).teardown(() => app.container.restore(FaviconResolutionService));

	test("should bump the shared favicon epoch so pages stop using the browser's stale cache", async ({
		client,
		assert,
	}) => {
		const admin = await createAdmin('favicon-admin-epoch');
		const before = await client
			.get('/admin/favicons')
			.withInertia()
			.loginAs(admin);

		await client
			.post('/admin/favicons/flush')
			.withCsrfToken()
			.loginAs(admin)
			.redirects(0);

		const after = await client
			.get('/admin/favicons')
			.withInertia()
			.loginAs(admin);

		assert.notEqual(
			after.inertiaProps?.faviconEpoch,
			before.inertiaProps?.faviconEpoch
		);
	});

	test('should reject mass actions from a non-administrator', async ({
		client,
	}) => {
		const user = await createUser({
			emailPrefix: 'favicon-admin-mass-refused',
		});

		const response = await client
			.post('/admin/favicons/purge-orphans')
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertHeader('location', FAVORITES_ROUTE);
	});
});
