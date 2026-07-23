import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import Link from '#models/link';
import User from '#models/user';
import Collection from '#models/collection';

async function createUser() {
	return User.create({
		email: `api-create-link-${Date.now()}@example.com`,
		name: 'Create Link Test User',
		avatarUrl: 'https://example.com/avatar.png',
		providerId: Date.now(),
	});
}

test.group('API create link — default collection', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should file a link under an auto-created default collection when collectionId is omitted', async ({
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

		const defaultCollection = await Collection.query()
			.where('author_id', user.id)
			.andWhere('is_default', true)
			.firstOrFail();
		assert.equal(defaultCollection.name, 'Inbox');

		const link = await Link.query()
			.where('author_id', user.id)
			.andWhere('name', 'A link with no collection')
			.firstOrFail();
		assert.equal(link.collectionId, defaultCollection.id);
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

		const defaultCollection = await Collection.query()
			.where('author_id', user.id)
			.andWhere('is_default', true)
			.firstOrFail();

		const response = await client
			.delete(`/api/v1/collections/${defaultCollection.id}`)
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(400);
	});
});
