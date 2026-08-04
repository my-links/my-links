import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { createCollection } from '#tests/factories/collection_factory';

async function followerPosition(collectionId: number, userId: number) {
	const row = await db
		.from('collection_followers')
		.where('collection_id', collectionId)
		.andWhere('user_id', userId)
		.first();
	return row?.position as number;
}

async function collectionUpdatedAt(collectionId: number) {
	const collection = await Collection.findOrFail(collectionId);
	return collection.updatedAt;
}

test.group('Reorder followed collections', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test("should persist per-follower order without affecting another follower's order", async ({
		client,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'reorder-followed-owner' });
		const followerOne = await createUser({
			emailPrefix: 'reorder-followed-one',
		});
		const followerTwo = await createUser({
			emailPrefix: 'reorder-followed-two',
		});
		const first = await createCollection({
			author: owner,
			name: 'First',
			visibility: Visibility.PUBLIC,
		});
		const second = await createCollection({
			author: owner,
			name: 'Second',
			visibility: Visibility.PUBLIC,
		});
		// Positions are only computed on the real follow path — the factory's
		// raw attach leaves every row at the DB default of 0.
		for (const follower of [followerOne, followerTwo]) {
			for (const collection of [first, second]) {
				await client
					.post(`/collections/${collection.id}/follow`)
					.withCsrfToken()
					.loginAs(follower)
					.redirects(0);
			}
		}

		await client
			.put('/collections/followed/reorder')
			.json({ collectionIds: [second.id, first.id] })
			.withCsrfToken()
			.loginAs(followerOne)
			.redirects(0);

		const followerOneFirst = await followerPosition(first.id, followerOne.id);
		const followerOneSecond = await followerPosition(second.id, followerOne.id);
		const followerTwoFirst = await followerPosition(first.id, followerTwo.id);
		const followerTwoSecond = await followerPosition(second.id, followerTwo.id);

		assert.isBelow(followerOneSecond, followerOneFirst);
		assert.isBelow(followerTwoFirst, followerTwoSecond);
	});

	test('should reject a collection the user does not follow', async ({
		client,
	}) => {
		const owner = await createUser({ emailPrefix: 'reorder-nf-owner' });
		const follower = await createUser({ emailPrefix: 'reorder-nf-follower' });
		const followed = await createCollection({
			author: owner,
			name: 'Followed',
			visibility: Visibility.PUBLIC,
		});
		const notFollowed = await createCollection({
			author: owner,
			name: 'Not followed',
			visibility: Visibility.PUBLIC,
		});
		await client
			.post(`/collections/${followed.id}/follow`)
			.withCsrfToken()
			.loginAs(follower)
			.redirects(0);

		const response = await client
			.put('/collections/followed/reorder')
			.json({ collectionIds: [followed.id, notFollowed.id] })
			.withCsrfToken()
			.loginAs(follower)
			.redirects(0);

		response.assertStatus(422);
	});

	test('should not touch collections.updated_at', async ({
		client,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'reorder-touch-owner' });
		const follower = await createUser({
			emailPrefix: 'reorder-touch-follower',
		});
		const first = await createCollection({
			author: owner,
			name: 'First',
			visibility: Visibility.PUBLIC,
		});
		const second = await createCollection({
			author: owner,
			name: 'Second',
			visibility: Visibility.PUBLIC,
		});
		for (const collection of [first, second]) {
			await client
				.post(`/collections/${collection.id}/follow`)
				.withCsrfToken()
				.loginAs(follower)
				.redirects(0);
		}
		const before = await collectionUpdatedAt(first.id);

		await client
			.put('/collections/followed/reorder')
			.json({ collectionIds: [second.id, first.id] })
			.withCsrfToken()
			.loginAs(follower)
			.redirects(0);

		const after = await collectionUpdatedAt(first.id);
		assert.equal(after?.toMillis(), before?.toMillis());
	});
});
