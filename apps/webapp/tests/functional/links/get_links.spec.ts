import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import { createUser } from '#tests/factories/user_factory';
import { createCollection } from '#tests/factories/collection_factory';
import {
	attachLinkToCollection,
	createLink,
} from '#tests/factories/link_factory';

test.group('Get links', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should redirect an unauthenticated request to login', async ({
		client,
	}) => {
		const response = await client.get('/links').redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});

	test("should only return the authenticated user's links", async ({
		client,
	}) => {
		const owner = await createUser();
		const stranger = await createUser();

		await createLink({
			author: owner,
			name: 'My link',
			url: 'https://example.com/mine',
		});
		await createLink({
			author: stranger,
			name: "Stranger's link",
			url: 'https://example.com/theirs',
		});

		const response = await client.get('/links').loginAs(owner);

		response.assertStatus(200);
		response.assertBodyContains({ data: [{ name: 'My link' }] });
		response.assertBodyNotContains({ data: [{ name: "Stranger's link" }] });
	});

	test("should include each link's collection ids", async ({
		client,
		assert,
	}) => {
		const owner = await createUser();
		const collection = await createCollection({ author: owner });
		const link = await createLink({ author: owner, name: 'My link' });
		await attachLinkToCollection(link, collection);

		const response = await client.get('/links').loginAs(owner);

		response.assertStatus(200);
		const { data } = response.body() as {
			data: Array<{ collectionIds: number[] }>;
		};
		assert.deepEqual(data[0].collectionIds, [collection.id]);
	});
});
