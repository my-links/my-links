import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';

async function createUser() {
	return User.create({
		email: `api-search-${Date.now()}@example.com`,
		name: 'Search Test User',
		avatarUrl: 'https://example.com/avatar.png',
		providerId: Date.now(),
	});
}

test.group('API search', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should reject requests without a token', async ({ client }) => {
		const response = await client
			.get('/api/v1/search')
			.qs({ term: 'anything' });

		response.assertStatus(401);
	});

	test('should return matching collections for an authenticated request', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		await Collection.create({
			name: 'My Searchable Collection',
			description: null,
			visibility: Visibility.PRIVATE,
			icon: null,
			authorId: user.id,
		});

		const response = await client
			.get('/api/v1/search')
			.qs({ term: 'Searchable' })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);
		const results = response.body().data as unknown[];
		assert.isArray(results);
		assert.isTrue(results.length > 0);
	});
});
