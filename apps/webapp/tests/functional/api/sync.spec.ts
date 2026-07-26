import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import type User from '#models/user';
import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { TOMBSTONE_RETENTION_DAYS } from '#services/sync/sync_service';

async function createCollection(user: User, name: string) {
	return Collection.create({
		name,
		description: null,
		visibility: Visibility.PRIVATE,
		icon: null,
		authorId: user.id,
	});
}

/**
 * Rewinds a row's `updated_at` instead of sleeping in the test: the endpoint
 * rewinds every cursor by a one-second overlap window, so anything written
 * "just now" would otherwise always come back.
 */
async function backdateUpdatedAt(tableName: string, id: number, ago: object) {
	await db
		.from(tableName)
		.where('id', id)
		.update({ updated_at: DateTime.now().minus(ago).toJSDate() });
}

function cursorMinutesAgo(minutes: number) {
	return DateTime.now().minus({ minutes }).toString();
}

test.group('API sync — full snapshot', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should return every collection and link when no cursor is given', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const work = await createCollection(user, 'Work');

		await client
			.post('/api/v1/links')
			.json({
				name: 'Snapshot link',
				url: 'https://example.com/snapshot',
				favorite: false,
				collectionIds: [work.id],
			})
			.withGuard('api')
			.loginAs(user);

		const response = await client
			.get('/api/v1/sync')
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);
		const body = response.body();
		assert.isTrue(body.isFullSync);
		assert.isString(body.syncedAt);
		assert.lengthOf(body.collections, 1);
		assert.lengthOf(body.links, 1);
		assert.sameMembers(body.links[0].collectionIds, [work.id]);
		assert.isEmpty(body.deletedLinkIds);
		assert.isEmpty(body.deletedCollectionIds);
	});

	test('should fall back to a full snapshot when the cursor predates tombstone retention', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		await createCollection(user, 'Work');

		const expiredCursor = DateTime.now()
			.minus({ days: TOMBSTONE_RETENTION_DAYS + 1 })
			.toString();

		const response = await client
			.get('/api/v1/sync')
			.qs({ since: expiredCursor })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);
		assert.isTrue(response.body().isFullSync);
		assert.lengthOf(response.body().collections, 1);
	});

	test('should reject a malformed cursor', async ({ client }) => {
		const user = await createUser();

		const response = await client
			.get('/api/v1/sync')
			.qs({ since: 'not-a-timestamp' })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(422);
	});
});

test.group('API sync — incremental delta', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should omit entities untouched since the cursor', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const stale = await createCollection(user, 'Stale');
		await backdateUpdatedAt('collections', stale.id, { hours: 1 });
		const fresh = await createCollection(user, 'Fresh');

		const response = await client
			.get('/api/v1/sync')
			.qs({ since: cursorMinutesAgo(1) })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);
		assert.isFalse(response.body().isFullSync);
		assert.deepEqual(
			response.body().collections.map((collection) => collection.id),
			[fresh.id]
		);
	});

	test('should report a deleted link as a tombstone', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const work = await createCollection(user, 'Work');

		const createResponse = await client
			.post('/api/v1/links')
			.json({
				name: 'Doomed link',
				url: 'https://example.com/doomed',
				favorite: false,
				collectionIds: [work.id],
			})
			.withGuard('api')
			.loginAs(user);
		const linkId = createResponse.body().link.id;

		await client
			.delete(`/api/v1/links/${linkId}`)
			.withGuard('api')
			.loginAs(user);

		const response = await client
			.get('/api/v1/sync')
			.qs({ since: cursorMinutesAgo(1) })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);
		assert.deepEqual(response.body().deletedLinkIds, [linkId]);
		assert.notInclude(
			response.body().links.map((link) => link.id),
			linkId
		);
	});

	test('should surface links whose only change is losing a collection', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const work = await createCollection(user, 'Work');
		const reading = await createCollection(user, 'Reading');

		const createResponse = await client
			.post('/api/v1/links')
			.json({
				name: 'Shared link',
				url: 'https://example.com/shared',
				favorite: false,
				collectionIds: [work.id, reading.id],
			})
			.withGuard('api')
			.loginAs(user);
		const linkId = createResponse.body().link.id;
		await backdateUpdatedAt('links', linkId, { hours: 1 });

		const deleteResponse = await client
			.delete(`/api/v1/collections/${work.id}`)
			.withGuard('api')
			.loginAs(user);
		deleteResponse.assertStatus(200);

		const response = await client
			.get('/api/v1/sync')
			.qs({ since: cursorMinutesAgo(1) })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);
		assert.deepEqual(response.body().deletedCollectionIds, [work.id]);
		assert.deepEqual(
			response.body().links.map((link) => link.id),
			[linkId]
		);
		assert.sameMembers(response.body().links[0].collectionIds, [reading.id]);
	});

	test('should surface a link whose favourite flag was toggled', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const work = await createCollection(user, 'Work');

		const createResponse = await client
			.post('/api/v1/links')
			.json({
				name: 'Toggled link',
				url: 'https://example.com/toggled',
				favorite: false,
				collectionIds: [work.id],
			})
			.withGuard('api')
			.loginAs(user);
		const linkId = createResponse.body().link.id;
		await backdateUpdatedAt('links', linkId, { hours: 1 });

		const toggleResponse = await client
			.put(`/links/${linkId}/favorite`)
			.form({ favorite: true })
			.withCsrfToken()
			.loginAs(user);
		toggleResponse.assertStatus(200);

		const response = await client
			.get('/api/v1/sync')
			.qs({ since: cursorMinutesAgo(1) })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);
		assert.deepEqual(
			response.body().links.map((link) => link.id),
			[linkId]
		);
		assert.isTrue(response.body().links[0].favorite);
	});
});
