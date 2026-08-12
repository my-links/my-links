import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { createCollection } from '#tests/factories/collection_factory';

async function isFollowing(collectionId: number, userId: number) {
	const row = await db
		.from('collection_followers')
		.where('collection_id', collectionId)
		.andWhere('user_id', userId)
		.first();
	return !!row;
}

test.group('Follow collection', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should reject an owner following their own collection', async ({
		client,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'follow-own-owner' });
		const collection = await createCollection({
			author: owner,
			name: 'Own public collection',
			visibility: VISIBILITY.PUBLIC,
		});

		const response = await client
			.post(`/collections/${collection.id}/follow`)
			.withCsrfToken()
			.loginAs(owner)
			.redirects(0);

		response.assertStatus(422);
		assert.isFalse(await isFollowing(collection.id, owner.id));
	});

	test('should let another user follow a public collection', async ({
		client,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'follow-other-owner' });
		const follower = await createUser({ emailPrefix: 'follow-other-follower' });
		const collection = await createCollection({
			author: owner,
			name: 'Public collection',
			visibility: VISIBILITY.PUBLIC,
		});

		await client
			.post(`/collections/${collection.id}/follow`)
			.withCsrfToken()
			.loginAs(follower)
			.redirects(0);

		assert.isTrue(await isFollowing(collection.id, follower.id));
	});
});
