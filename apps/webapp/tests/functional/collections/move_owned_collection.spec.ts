import testUtils from '@adonisjs/core/services/test_utils';
import db from '@adonisjs/lucid/services/db';
import { test } from '@japa/runner';

import { VISIBILITY, type Visibility } from '#enums/collections/visibility';
import Collection from '#models/collection';
import {
	createInbox,
	createCollection,
	followCollection,
} from '#tests/factories/collection_factory';
import { createUser } from '#tests/factories/user_factory';

async function sectionIds(userId: number, visibility: Visibility) {
	const collections = await Collection.query()
		.where('author_id', userId)
		.andWhere('visibility', visibility)
		.andWhere('is_default', false)
		.orderBy('position', 'asc');
	return collections.map((collection) => collection.id);
}

async function followersCount(collectionId: number) {
	const rows = await db
		.from('collection_followers')
		.where('collection_id', collectionId)
		.count('* as total');
	return Number(rows[0].total);
}

test.group('Move owned collection', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should move a private collection to public at the given position when the membership matches', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const moved = await createCollection({ author: user, name: 'Moved' });
		const publicFirst = await createCollection({
			author: user,
			name: 'Public A',
			visibility: VISIBILITY.PUBLIC,
		});
		const publicSecond = await createCollection({
			author: user,
			name: 'Public B',
			visibility: VISIBILITY.PUBLIC,
		});
		const targetOrder = [publicFirst.id, moved.id, publicSecond.id];

		const response = await client
			.put(`/collections/${moved.id}/section`)
			.json({ visibility: VISIBILITY.PUBLIC, collectionIds: targetOrder })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);
		const reloaded = await Collection.findOrFail(moved.id);
		assert.equal(reloaded.visibility, VISIBILITY.PUBLIC);
		assert.deepEqual(await sectionIds(user.id, VISIBILITY.PUBLIC), targetOrder);
	});

	test('should move a public collection to private and remove its followers', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'move-owner' });
		const follower = await createUser({ emailPrefix: 'move-follower' });
		const moved = await createCollection({
			author: user,
			name: 'Moved',
			visibility: VISIBILITY.PUBLIC,
		});
		await followCollection(moved, follower);

		const response = await client
			.put(`/collections/${moved.id}/section`)
			.json({ visibility: VISIBILITY.PRIVATE, collectionIds: [moved.id] })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);
		const reloaded = await Collection.findOrFail(moved.id);
		assert.equal(reloaded.visibility, VISIBILITY.PRIVATE);
		assert.equal(await followersCount(moved.id), 0);
	});

	test('should keep followers when moving within the same visibility', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'move-owner' });
		const follower = await createUser({ emailPrefix: 'move-follower' });
		const first = await createCollection({
			author: user,
			name: 'A',
			visibility: VISIBILITY.PUBLIC,
		});
		const second = await createCollection({
			author: user,
			name: 'B',
			visibility: VISIBILITY.PUBLIC,
		});
		await followCollection(first, follower);

		const response = await client
			.put(`/collections/${first.id}/section`)
			.json({
				visibility: VISIBILITY.PUBLIC,
				collectionIds: [second.id, first.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);
		assert.equal(await followersCount(first.id), 1);
		assert.deepEqual(await sectionIds(user.id, VISIBILITY.PUBLIC), [
			second.id,
			first.id,
		]);
	});

	test('should reject making the default collection public', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'move-inbox' });
		const inbox = await createInbox(user);

		const response = await client
			.put(`/collections/${inbox.id}/section`)
			.json({ visibility: VISIBILITY.PUBLIC, collectionIds: [inbox.id] })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(400);
		const reloaded = await Collection.findOrFail(inbox.id);
		assert.equal(reloaded.visibility, VISIBILITY.PRIVATE);
	});

	test('should return 409 when collectionIds do not match the target section plus the moved collection', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const moved = await createCollection({ author: user, name: 'Moved' });
		await createCollection({
			author: user,
			name: 'Public A',
			visibility: VISIBILITY.PUBLIC,
		});

		const response = await client
			.put(`/collections/${moved.id}/section`)
			.json({ visibility: VISIBILITY.PUBLIC, collectionIds: [moved.id] })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(409);
		const reloaded = await Collection.findOrFail(moved.id);
		assert.equal(reloaded.visibility, VISIBILITY.PRIVATE);
	});

	test('should redirect home without moving when the collection belongs to another user', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'move-owner' });
		const stranger = await createUser({ emailPrefix: 'move-stranger' });
		const foreign = await createCollection({
			author: stranger,
			name: 'Theirs',
		});

		const response = await client
			.put(`/collections/${foreign.id}/section`)
			.json({ visibility: VISIBILITY.PUBLIC, collectionIds: [foreign.id] })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);
		const reloaded = await Collection.findOrFail(foreign.id);
		assert.equal(reloaded.visibility, VISIBILITY.PRIVATE);
	});

	test('should reject unauthenticated requests', async ({ client, assert }) => {
		const user = await createUser();
		const collection = await createCollection({ author: user, name: 'A' });

		const response = await client
			.put(`/collections/${collection.id}/section`)
			.json({
				visibility: VISIBILITY.PUBLIC,
				collectionIds: [collection.id],
			})
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		const reloaded = await Collection.findOrFail(collection.id);
		assert.equal(reloaded.visibility, VISIBILITY.PRIVATE);
	});
});
