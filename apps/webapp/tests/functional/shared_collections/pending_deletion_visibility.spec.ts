import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import { VISIBILITY } from '#enums/collections/visibility';
import {
	createUser,
	requestAccountDeletion,
} from '#tests/factories/user_factory';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';
import {
	createCollection,
	followCollection,
} from '#tests/factories/collection_factory';

// A missing row sends web visitors home, the same answer a private collection gets.
const NOT_FOUND_REDIRECT = '/';

async function seedCollectionOfLeavingAccount() {
	const owner = await createUser({ emailPrefix: 'leaving-owner' });
	const collection = await createCollection({
		author: owner,
		visibility: VISIBILITY.PUBLIC,
	});
	const link = await createLink({ author: owner });
	await attachLinkToCollection(link, collection);
	await requestAccountDeletion(owner);
	return { owner, collection, link };
}

test.group('Public collections of an account pending deletion', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 404 on the shared page for an anonymous visitor', async ({
		client,
	}) => {
		const { collection } = await seedCollectionOfLeavingAccount();

		const response = await client.get(`/shared/${collection.id}`).redirects(0);

		response.assertHeader('location', NOT_FOUND_REDIRECT);
	});

	test('should answer 404 on the link redirect for an anonymous visitor', async ({
		client,
	}) => {
		const { link } = await seedCollectionOfLeavingAccount();

		const response = await client.get(`/l/${link.id}`).redirects(0);

		response.assertHeader('location', NOT_FOUND_REDIRECT);
	});

	test('should leave the collection out of the followed collections served by the API', async ({
		client,
		assert,
	}) => {
		const { collection } = await seedCollectionOfLeavingAccount();
		const follower = await createUser({ emailPrefix: 'leaving-follower' });
		await followCollection(collection, follower);

		const response = await client
			.get('/api/v1/collections')
			.withGuard('api')
			.loginAs(follower);

		const body = response.body() as { followedCollections: unknown[] };
		assert.lengthOf(body.followedCollections, 0);
	});

	test('should answer 404 when a follower opens the collection', async ({
		client,
	}) => {
		const { collection } = await seedCollectionOfLeavingAccount();
		const follower = await createUser({ emailPrefix: 'leaving-viewer' });
		await followCollection(collection, follower);

		const response = await client
			.get(`/collections/${collection.id}`)
			.loginAs(follower)
			.redirects(0);

		response.assertHeader('location', NOT_FOUND_REDIRECT);
	});

	test('should refuse to follow the collection', async ({ client, assert }) => {
		const { collection } = await seedCollectionOfLeavingAccount();
		const follower = await createUser({ emailPrefix: 'leaving-new-follower' });

		const response = await client
			.post(`/collections/${collection.id}/follow`)
			.withCsrfToken()
			.loginAs(follower)
			.redirects(0);

		response.assertHeader('location', NOT_FOUND_REDIRECT);
		assert.isFalse(
			await collection
				.related('followers')
				.query()
				.where('users.id', follower.id)
				.first()
				.then(Boolean)
		);
	});

	test('should still serve the collection to its own author', async ({
		client,
	}) => {
		const { owner, collection } = await seedCollectionOfLeavingAccount();

		const response = await client
			.get(`/collections/${collection.id}`)
			.loginAs(owner)
			.redirects(0);

		response.assertStatus(200);
	});

	test('should accept a followed reorder that leaves the hidden collection out', async ({
		client,
	}) => {
		const { collection: hidden } = await seedCollectionOfLeavingAccount();
		const otherOwner = await createUser({ emailPrefix: 'staying-owner' });
		const visible = await createCollection({
			author: otherOwner,
			visibility: VISIBILITY.PUBLIC,
		});
		const follower = await createUser({ emailPrefix: 'reordering-follower' });
		await followCollection(hidden, follower);
		await followCollection(visible, follower);

		const response = await client
			.put('/collections/followed/reorder')
			.json({ collectionIds: [visible.id] })
			.withCsrfToken()
			.loginAs(follower)
			.redirects(0);

		response.assertStatus(302);
	});
});
