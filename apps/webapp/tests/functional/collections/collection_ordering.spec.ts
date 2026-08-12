import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import Collection from '#models/collection';
import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { createCollection } from '#tests/factories/collection_factory';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';

async function collectionLinkPosition(collectionId: number, linkId: number) {
	const row = await db
		.from('collection_link')
		.where('collection_id', collectionId)
		.andWhere('link_id', linkId)
		.first();
	return row?.position as number;
}

async function followerPosition(collectionId: number, userId: number) {
	const row = await db
		.from('collection_followers')
		.where('collection_id', collectionId)
		.andWhere('user_id', userId)
		.first();
	return row?.position as number;
}

test.group('Collection ordering — collections', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should append a newly created collection at the end of its section', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		await createCollection({ author: user, name: 'First' });

		await client
			.post('/collections')
			.json({
				name: 'Second',
				description: null,
				visibility: VISIBILITY.PRIVATE,
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const collections = await Collection.query()
			.where('author_id', user.id)
			.andWhere('visibility', VISIBILITY.PRIVATE)
			.orderBy('position', 'asc');

		assert.lengthOf(collections, 2);
		assert.equal(collections[0].name, 'First');
		assert.equal(collections[1].name, 'Second');
		assert.isBelow(collections[0].position, collections[1].position);
	});

	test('should move a collection to the end of the target section when visibility changes', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		await createCollection({
			author: user,
			name: 'Existing public',
			visibility: VISIBILITY.PUBLIC,
		});
		const moving = await createCollection({
			author: user,
			name: 'Moving',
			visibility: VISIBILITY.PRIVATE,
		});

		await client
			.put(`/collections/${moving.id}`)
			.json({
				name: 'Moving',
				description: null,
				visibility: VISIBILITY.PUBLIC,
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const updated = await Collection.findOrFail(moving.id);
		const existingPublic = await Collection.query()
			.where('author_id', user.id)
			.andWhere('visibility', VISIBILITY.PUBLIC)
			.andWhereNot('id', moving.id)
			.firstOrFail();

		assert.equal(updated.visibility, VISIBILITY.PUBLIC);
		assert.isAbove(updated.position, existingPublic.position);
	});

	test("should place followed collections at the end of the follower's list on follow", async ({
		client,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'ordering-owner' });
		const follower = await createUser({ emailPrefix: 'ordering-follower' });
		const firstPublic = await createCollection({
			author: owner,
			name: 'First public',
			visibility: VISIBILITY.PUBLIC,
		});
		const secondPublic = await createCollection({
			author: owner,
			name: 'Second public',
			visibility: VISIBILITY.PUBLIC,
		});

		await client
			.post(`/collections/${firstPublic.id}/follow`)
			.withCsrfToken()
			.loginAs(follower)
			.redirects(0);
		await client
			.post(`/collections/${secondPublic.id}/follow`)
			.withCsrfToken()
			.loginAs(follower)
			.redirects(0);

		const firstPosition = await followerPosition(firstPublic.id, follower.id);
		const secondPosition = await followerPosition(secondPublic.id, follower.id);

		assert.isBelow(firstPosition, secondPosition);
	});
});

test.group('Collection ordering — links', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should append a newly created link at the end of its collections', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const collection = await createCollection({ author: user, name: 'Work' });
		const existingLink = await createLink({ author: user, name: 'Existing' });
		await attachLinkToCollection(existingLink, collection);

		await client
			.post('/links')
			.json({
				name: 'New link',
				url: 'https://example.com/new',
				favorite: false,
				collectionIds: [collection.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const newLink = await db
			.from('links')
			.where('author_id', user.id)
			.andWhere('name', 'New link')
			.firstOrFail();

		const existingPosition = await collectionLinkPosition(
			collection.id,
			existingLink.id
		);
		const newPosition = await collectionLinkPosition(collection.id, newLink.id);

		assert.isAbove(newPosition, existingPosition);
	});

	test("should preserve positions of unchanged collections when a link's collection set is edited", async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const collectionA = await createCollection({ author: user, name: 'A' });
		const collectionB = await createCollection({ author: user, name: 'B' });
		const otherLinkInA = await createLink({
			author: user,
			name: 'Other in A',
		});
		await attachLinkToCollection(otherLinkInA, collectionA);
		const link = await createLink({ author: user, name: 'Shared' });
		await attachLinkToCollection(link, collectionA);

		const positionBefore = await collectionLinkPosition(
			collectionA.id,
			link.id
		);

		await client
			.put(`/links/${link.id}`)
			.json({
				name: 'Shared',
				url: 'https://example.com',
				favorite: false,
				collectionIds: [collectionA.id, collectionB.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const positionAfter = await collectionLinkPosition(collectionA.id, link.id);
		const positionInB = await collectionLinkPosition(collectionB.id, link.id);

		assert.equal(positionAfter, positionBefore);
		assert.isNumber(positionInB);
	});

	test('should append re-homed links at the end of the Inbox when their collection is deleted', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const doomed = await createCollection({ author: user, name: 'Doomed' });
		const linkOne = await createLink({ author: user, name: 'One' });
		await attachLinkToCollection(linkOne, doomed);
		const linkTwo = await createLink({ author: user, name: 'Two' });
		await attachLinkToCollection(linkTwo, doomed);

		await client
			.delete(`/collections/${doomed.id}`)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const inbox = await Collection.query()
			.where('author_id', user.id)
			.andWhere('is_default', true)
			.firstOrFail();

		const positionOne = await collectionLinkPosition(inbox.id, linkOne.id);
		const positionTwo = await collectionLinkPosition(inbox.id, linkTwo.id);

		assert.isNumber(positionOne);
		assert.isNumber(positionTwo);
		assert.notEqual(positionOne, positionTwo);
	});
});
