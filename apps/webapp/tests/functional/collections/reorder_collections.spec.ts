import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import {
	createInbox,
	createCollection,
} from '#tests/factories/collection_factory';

async function collectionUpdatedAt(collectionId: number) {
	const row = await db.from('collections').where('id', collectionId).first();
	return row?.updated_at as Date;
}

test.group('Reorder owned collections', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should persist the submitted order for a section', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const first = await createCollection({ author: user, name: 'A' });
		const second = await createCollection({ author: user, name: 'B' });
		const third = await createCollection({ author: user, name: 'C' });

		const response = await client
			.put('/collections/owned/reorder')
			.json({
				visibility: Visibility.PRIVATE,
				collectionIds: [third.id, first.id, second.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);

		const ordered = await Collection.query()
			.where('author_id', user.id)
			.andWhere('visibility', Visibility.PRIVATE)
			.orderBy('position', 'asc');

		assert.deepEqual(
			ordered.map((collection) => collection.id),
			[third.id, first.id, second.id]
		);
	});

	test('should keep the two visibility sections independently ordered', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const privateFirst = await createCollection({
			author: user,
			name: 'Private A',
			visibility: Visibility.PRIVATE,
		});
		const privateSecond = await createCollection({
			author: user,
			name: 'Private B',
			visibility: Visibility.PRIVATE,
		});
		const publicFirst = await createCollection({
			author: user,
			name: 'Public A',
			visibility: Visibility.PUBLIC,
		});
		const publicSecond = await createCollection({
			author: user,
			name: 'Public B',
			visibility: Visibility.PUBLIC,
		});

		await client
			.put('/collections/owned/reorder')
			.json({
				visibility: Visibility.PRIVATE,
				collectionIds: [privateSecond.id, privateFirst.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const publicOrder = await Collection.query()
			.where('author_id', user.id)
			.andWhere('visibility', Visibility.PUBLIC)
			.orderBy('position', 'asc');

		assert.deepEqual(
			publicOrder.map((collection) => collection.id),
			[publicFirst.id, publicSecond.id]
		);
	});

	test('should accept a payload that leaves the Inbox out', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reorder-inbox' });
		await createInbox(user);
		const first = await createCollection({ author: user, name: 'A' });
		const second = await createCollection({ author: user, name: 'B' });

		const response = await client
			.put('/collections/owned/reorder')
			.json({
				visibility: Visibility.PRIVATE,
				collectionIds: [second.id, first.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);
	});

	test('should leave the Inbox out of the reordered positions', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reorder-inbox' });
		const inbox = await createInbox(user);
		const first = await createCollection({ author: user, name: 'A' });
		const second = await createCollection({ author: user, name: 'B' });

		await client
			.put('/collections/owned/reorder')
			.json({
				visibility: Visibility.PRIVATE,
				collectionIds: [second.id, first.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const reorderedInbox = await Collection.findOrFail(inbox.id);
		assert.equal(reorderedInbox.position, inbox.position);
	});

	test('should reject a payload that includes the Inbox', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reorder-inbox' });
		const inbox = await createInbox(user);
		const collection = await createCollection({ author: user, name: 'A' });

		const response = await client
			.put('/collections/owned/reorder')
			.json({
				visibility: Visibility.PRIVATE,
				collectionIds: [collection.id, inbox.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(409);
	});

	test('should reject a collection owned by another user', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reorder-owner' });
		const stranger = await createUser({ emailPrefix: 'reorder-stranger' });
		const own = await createCollection({ author: user, name: 'Mine' });
		const foreign = await createCollection({
			author: stranger,
			name: 'Theirs',
		});

		const response = await client
			.put('/collections/owned/reorder')
			.json({
				visibility: Visibility.PRIVATE,
				collectionIds: [own.id, foreign.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(422);
	});

	test('should reject a payload missing a collection from the section', async ({
		client,
	}) => {
		const user = await createUser();
		const first = await createCollection({ author: user, name: 'A' });
		await createCollection({ author: user, name: 'B' });

		const response = await client
			.put('/collections/owned/reorder')
			.json({
				visibility: Visibility.PRIVATE,
				collectionIds: [first.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(409);
	});

	test('should reject a collection from the other section', async ({
		client,
	}) => {
		const user = await createUser();
		const privateOne = await createCollection({
			author: user,
			name: 'Private',
			visibility: Visibility.PRIVATE,
		});
		const publicOne = await createCollection({
			author: user,
			name: 'Public',
			visibility: Visibility.PUBLIC,
		});

		const response = await client
			.put('/collections/owned/reorder')
			.json({
				visibility: Visibility.PRIVATE,
				collectionIds: [privateOne.id, publicOne.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(409);
	});

	test('should bump updated_at so the reorder reaches the sync feed', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const first = await createCollection({ author: user, name: 'A' });
		const second = await createCollection({ author: user, name: 'B' });
		const before = await collectionUpdatedAt(first.id);

		await client
			.put('/collections/owned/reorder')
			.json({
				visibility: Visibility.PRIVATE,
				collectionIds: [second.id, first.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const after = await collectionUpdatedAt(first.id);
		assert.isTrue(after.getTime() > before.getTime());
	});

	test('should be idempotent when replayed', async ({ client, assert }) => {
		const user = await createUser();
		const first = await createCollection({ author: user, name: 'A' });
		const second = await createCollection({ author: user, name: 'B' });
		const payload = {
			visibility: Visibility.PRIVATE,
			collectionIds: [second.id, first.id],
		};

		await client
			.put('/collections/owned/reorder')
			.json(payload)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);
		const response = await client
			.put('/collections/owned/reorder')
			.json(payload)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);

		const ordered = await Collection.query()
			.where('author_id', user.id)
			.andWhere('visibility', Visibility.PRIVATE)
			.orderBy('position', 'asc');
		assert.deepEqual(
			ordered.map((collection) => collection.id),
			[second.id, first.id]
		);
	});
});
