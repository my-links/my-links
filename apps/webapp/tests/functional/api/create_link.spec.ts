import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';
import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';

async function createCollection(user: User, name: string) {
	return Collection.create({
		name,
		description: null,
		visibility: VISIBILITY.PRIVATE,
		icon: null,
		authorId: user.id,
	});
}

async function getDefaultCollection(user: User) {
	return Collection.query()
		.where('author_id', user.id)
		.andWhere('is_default', true)
		.firstOrFail();
}

test.group('API create link — description length', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should accept a description at the validator’s 300-character limit', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'description-length' });
		const description = 'a'.repeat(300);

		const response = await client
			.post('/api/v1/links')
			.json({
				name: 'Long description',
				description,
				url: 'https://example.com',
				favorite: false,
			})
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);
		const link = await Link.query()
			.where('author_id', user.id)
			.andWhere('name', 'Long description')
			.firstOrFail();
		assert.equal(link.description, description);
	});
});

test.group('API create link — default collection', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should file a link under an auto-created default collection when collectionIds is omitted', async ({
		client,
		assert,
	}) => {
		const user = await createUser();

		const response = await client
			.post('/api/v1/links')
			.json({
				name: 'A link with no collection',
				url: 'https://example.com',
				favorite: false,
			})
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);

		const defaultCollection = await getDefaultCollection(user);
		assert.equal(defaultCollection.name, 'Inbox');

		const link = await Link.query()
			.where('author_id', user.id)
			.andWhere('name', 'A link with no collection')
			.preload('collections')
			.firstOrFail();
		assert.lengthOf(link.collections, 1);
		assert.equal(link.collections[0].id, defaultCollection.id);
	});

	test('should reuse the same default collection across multiple link creations', async ({
		client,
		assert,
	}) => {
		const user = await createUser();

		await client
			.post('/api/v1/links')
			.json({ name: 'First', url: 'https://example.com/1', favorite: false })
			.withGuard('api')
			.loginAs(user);

		await client
			.post('/api/v1/links')
			.json({ name: 'Second', url: 'https://example.com/2', favorite: false })
			.withGuard('api')
			.loginAs(user);

		const defaultCollections = await Collection.query()
			.where('author_id', user.id)
			.andWhere('is_default', true);
		assert.lengthOf(defaultCollections, 1);
	});

	test('should reject deleting the default collection', async ({ client }) => {
		const user = await createUser();

		await client
			.post('/api/v1/links')
			.json({ name: 'Seed link', url: 'https://example.com', favorite: false })
			.withGuard('api')
			.loginAs(user);

		const defaultCollection = await getDefaultCollection(user);

		const response = await client
			.delete(`/api/v1/collections/${defaultCollection.id}`)
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(400);
	});
});

test.group('API create link — multiple collections', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should file a link under every collection listed in collectionIds', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const work = await createCollection(user, 'Work');
		const reading = await createCollection(user, 'Reading');

		const response = await client
			.post('/api/v1/links')
			.json({
				name: 'A link in two collections',
				url: 'https://example.com',
				favorite: false,
				collectionIds: [work.id, reading.id],
			})
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);

		const link = await Link.query()
			.where('author_id', user.id)
			.andWhere('name', 'A link in two collections')
			.preload('collections')
			.firstOrFail();
		assert.sameMembers(
			link.collections.map((collection) => collection.id),
			[work.id, reading.id]
		);
	});
});

test.group('API update link — collection membership', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should sync a link to a different set of collections on update', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const work = await createCollection(user, 'Work');
		const reading = await createCollection(user, 'Reading');
		const archive = await createCollection(user, 'Archive');

		const createResponse = await client
			.post('/api/v1/links')
			.json({
				name: 'Movable link',
				url: 'https://example.com',
				favorite: false,
				collectionIds: [work.id, reading.id],
			})
			.withGuard('api')
			.loginAs(user);
		const linkId = createResponse.body().link.id;

		const updateResponse = await client
			.put(`/api/v1/links/${linkId}`)
			.json({
				name: 'Movable link',
				url: 'https://example.com',
				favorite: false,
				collectionIds: [archive.id],
			})
			.withGuard('api')
			.loginAs(user);
		updateResponse.assertStatus(200);

		const link = await Link.query()
			.where('id', linkId)
			.preload('collections')
			.firstOrFail();
		assert.sameMembers(
			link.collections.map((collection) => collection.id),
			[archive.id]
		);
	});

	test('should fall back to the Inbox collection when all collections are cleared on update', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const work = await createCollection(user, 'Work');

		const createResponse = await client
			.post('/api/v1/links')
			.json({
				name: 'Lonely link',
				url: 'https://example.com',
				favorite: false,
				collectionIds: [work.id],
			})
			.withGuard('api')
			.loginAs(user);
		const linkId = createResponse.body().link.id;

		const updateResponse = await client
			.put(`/api/v1/links/${linkId}`)
			.json({
				name: 'Lonely link',
				url: 'https://example.com',
				favorite: false,
				collectionIds: [],
			})
			.withGuard('api')
			.loginAs(user);
		updateResponse.assertStatus(200);

		const defaultCollection = await getDefaultCollection(user);
		const link = await Link.query()
			.where('id', linkId)
			.preload('collections')
			.firstOrFail();
		assert.sameMembers(
			link.collections.map((collection) => collection.id),
			[defaultCollection.id]
		);
	});
});

test.group('API create/update link — foreign collection rejection', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should reject creating a link in another user’s collection', async ({
		client,
		assert,
	}) => {
		const owner = await createUser();
		const attacker = await createUser();
		const ownerCollection = await createCollection(owner, 'Owner-only');

		const response = await client
			.post('/api/v1/links')
			.json({
				name: 'Injected',
				url: 'https://injected.example',
				favorite: false,
				collectionIds: [ownerCollection.id],
			})
			.withGuard('api')
			.loginAs(attacker);

		response.assertStatus(422);

		const injectedLink = await Link.query()
			.where('author_id', attacker.id)
			.andWhere('name', 'Injected')
			.first();
		assert.isNull(injectedLink);
	});

	test('should reject updating a link into another user’s collection', async ({
		client,
		assert,
	}) => {
		const owner = await createUser();
		const attacker = await createUser();
		const ownerCollection = await createCollection(owner, 'Owner-only');
		const attackerCollection = await createCollection(attacker, 'Mine');

		const createResponse = await client
			.post('/api/v1/links')
			.json({
				name: 'Attacker link',
				url: 'https://example.com',
				favorite: false,
				collectionIds: [attackerCollection.id],
			})
			.withGuard('api')
			.loginAs(attacker);
		const linkId = createResponse.body().link.id;

		const updateResponse = await client
			.put(`/api/v1/links/${linkId}`)
			.json({
				name: 'Attacker link',
				url: 'https://example.com',
				favorite: false,
				collectionIds: [ownerCollection.id],
			})
			.withGuard('api')
			.loginAs(attacker);

		updateResponse.assertStatus(422);

		const link = await Link.query()
			.where('id', linkId)
			.preload('collections')
			.firstOrFail();
		assert.sameMembers(
			link.collections.map((collection) => collection.id),
			[attackerCollection.id]
		);
	});
});

test.group('API delete collection — orphaned links', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should move links that were only in the deleted collection to the default collection', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const work = await createCollection(user, 'Work');
		const reading = await createCollection(user, 'Reading');

		const onlyInWorkResponse = await client
			.post('/api/v1/links')
			.json({
				name: 'Only in Work',
				url: 'https://example.com/only',
				favorite: false,
				collectionIds: [work.id],
			})
			.withGuard('api')
			.loginAs(user);
		const onlyInWorkId = onlyInWorkResponse.body().link.id;

		const sharedResponse = await client
			.post('/api/v1/links')
			.json({
				name: 'In both',
				url: 'https://example.com/shared',
				favorite: false,
				collectionIds: [work.id, reading.id],
			})
			.withGuard('api')
			.loginAs(user);
		const sharedId = sharedResponse.body().link.id;

		const deleteResponse = await client
			.delete(`/api/v1/collections/${work.id}`)
			.withGuard('api')
			.loginAs(user);
		deleteResponse.assertStatus(200);

		const defaultCollection = await getDefaultCollection(user);

		const onlyInWorkLink = await Link.query()
			.where('id', onlyInWorkId)
			.preload('collections')
			.firstOrFail();
		assert.sameMembers(
			onlyInWorkLink.collections.map((collection) => collection.id),
			[defaultCollection.id]
		);

		const sharedLink = await Link.query()
			.where('id', sharedId)
			.preload('collections')
			.firstOrFail();
		assert.sameMembers(
			sharedLink.collections.map((collection) => collection.id),
			[reading.id]
		);
	});
});
