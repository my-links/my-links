import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import Collection from '#models/collection';
import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';
import {
	createCollection,
	followCollection,
} from '#tests/factories/collection_factory';

test.group('API reorder owned collections', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should persist the submitted order for a section', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const first = await createCollection({ author: user, name: 'A' });
		const second = await createCollection({ author: user, name: 'B' });

		const response = await client
			.put('/api/v1/collections/owned/reorder')
			.json({
				visibility: VISIBILITY.PRIVATE,
				collectionIds: [second.id, first.id],
			})
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);

		const ordered = await Collection.query()
			.where('author_id', user.id)
			.andWhere('visibility', VISIBILITY.PRIVATE)
			.orderBy('position', 'asc');
		assert.deepEqual(
			ordered.map((collection) => collection.id),
			[second.id, first.id]
		);
	});

	test('should reject a collection owned by another user', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'api-reorder-owner' });
		const stranger = await createUser({ emailPrefix: 'api-reorder-stranger' });
		const own = await createCollection({ author: user, name: 'Mine' });
		const foreign = await createCollection({
			author: stranger,
			name: 'Theirs',
		});

		const response = await client
			.put('/api/v1/collections/owned/reorder')
			.json({
				visibility: VISIBILITY.PRIVATE,
				collectionIds: [own.id, foreign.id],
			})
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(422);
	});

	test('should reject a payload missing a collection from the section', async ({
		client,
	}) => {
		const user = await createUser();
		const first = await createCollection({ author: user, name: 'A' });
		await createCollection({ author: user, name: 'B' });

		const response = await client
			.put('/api/v1/collections/owned/reorder')
			.json({
				visibility: VISIBILITY.PRIVATE,
				collectionIds: [first.id],
			})
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(409);
	});
});

test.group('API reorder followed collections', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test("should persist the follower's own order", async ({
		client,
		assert,
	}) => {
		const owner = await createUser({
			emailPrefix: 'api-reorder-followed-owner',
		});
		const follower = await createUser({
			emailPrefix: 'api-reorder-followed-follower',
		});
		const first = await createCollection({
			author: owner,
			name: 'First',
			visibility: VISIBILITY.PUBLIC,
		});
		const second = await createCollection({
			author: owner,
			name: 'Second',
			visibility: VISIBILITY.PUBLIC,
		});
		for (const collection of [first, second]) {
			await client
				.post(`/collections/${collection.id}/follow`)
				.withCsrfToken()
				.loginAs(follower)
				.redirects(0);
		}

		const response = await client
			.put('/api/v1/collections/followed/reorder')
			.json({ collectionIds: [second.id, first.id] })
			.withGuard('api')
			.loginAs(follower);

		response.assertStatus(200);

		const rows = await db
			.from('collection_followers')
			.where('user_id', follower.id)
			.orderBy('position', 'asc');
		assert.deepEqual(
			rows.map((row) => row.collection_id),
			[second.id, first.id]
		);
	});

	test('should reject a collection the user does not follow', async ({
		client,
	}) => {
		const owner = await createUser({ emailPrefix: 'api-reorder-nf-owner' });
		const follower = await createUser({
			emailPrefix: 'api-reorder-nf-follower',
		});
		const followed = await createCollection({
			author: owner,
			name: 'Followed',
			visibility: VISIBILITY.PUBLIC,
		});
		const notFollowed = await createCollection({
			author: owner,
			name: 'Not followed',
			visibility: VISIBILITY.PUBLIC,
		});
		await client
			.post(`/collections/${followed.id}/follow`)
			.withCsrfToken()
			.loginAs(follower)
			.redirects(0);

		const response = await client
			.put('/api/v1/collections/followed/reorder')
			.json({ collectionIds: [followed.id, notFollowed.id] })
			.withGuard('api')
			.loginAs(follower);

		response.assertStatus(422);
	});
});

test.group('API reorder collection links', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should persist the link order for the author', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const collection = await createCollection({ author: user, name: 'Work' });
		const first = await createLink({ author: user, name: 'First' });
		const second = await createLink({ author: user, name: 'Second' });
		await attachLinkToCollection(first, collection);
		await attachLinkToCollection(second, collection);

		const response = await client
			.put(`/api/v1/collections/${collection.id}/links/reorder`)
			.json({ linkIds: [second.id, first.id] })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);

		const rows = await db
			.from('collection_link')
			.where('collection_id', collection.id)
			.orderBy('position', 'asc');
		assert.deepEqual(
			rows.map((row) => row.link_id),
			[second.id, first.id]
		);
	});

	test('should reject a link that is not in the collection', async ({
		client,
	}) => {
		const user = await createUser();
		const collection = await createCollection({ author: user, name: 'Work' });
		const inCollection = await createLink({ author: user, name: 'In' });
		await attachLinkToCollection(inCollection, collection);
		const outsideLink = await createLink({ author: user, name: 'Outside' });

		const response = await client
			.put(`/api/v1/collections/${collection.id}/links/reorder`)
			.json({ linkIds: [inCollection.id, outsideLink.id] })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(409);
	});

	test('should reject a follower reordering links in a collection they follow', async ({
		client,
	}) => {
		const owner = await createUser({ emailPrefix: 'api-reorder-links-owner' });
		const follower = await createUser({
			emailPrefix: 'api-reorder-links-follower',
		});
		const collection = await createCollection({
			author: owner,
			name: 'Shared',
			visibility: VISIBILITY.PUBLIC,
		});
		const link = await createLink({ author: owner, name: 'Link' });
		await attachLinkToCollection(link, collection);
		await followCollection(collection, follower);

		const response = await client
			.put(`/api/v1/collections/${collection.id}/links/reorder`)
			.json({ linkIds: [link.id] })
			.withGuard('api')
			.loginAs(follower);

		// The ownership guard lives in the controller (`author_id` scoped
		// lookup), not the service — a follower must get a 404 here, same as
		// any other missing-row API response, not the session-only redirect
		// the Inertia controller falls back to.
		response.assertStatus(404);
	});
});

test.group('API move link between collections', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should detach from the source and attach to the target, leaving exactly one links row', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const source = await createCollection({ author: user, name: 'Source' });
		const target = await createCollection({ author: user, name: 'Target' });
		const link = await createLink({ author: user, name: 'Moving' });
		await attachLinkToCollection(link, source);

		const response = await client
			.put(`/api/v1/links/${link.id}/collection`)
			.json({ fromCollectionId: source.id, toCollectionId: target.id })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);

		const linkRows = await db.from('links').where('id', link.id);
		assert.lengthOf(linkRows, 1);

		const pivotRows = await db
			.from('collection_link')
			.where('link_id', link.id);
		assert.lengthOf(pivotRows, 1);
		assert.equal(pivotRows[0].collection_id, target.id);
	});

	test('should reject when either collection belongs to another user', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'api-move-owner' });
		const stranger = await createUser({ emailPrefix: 'api-move-stranger' });
		const source = await createCollection({ author: user, name: 'Source' });
		const foreignTarget = await createCollection({
			author: stranger,
			name: 'Theirs',
		});
		const link = await createLink({ author: user, name: 'Moving' });
		await attachLinkToCollection(link, source);

		const response = await client
			.put(`/api/v1/links/${link.id}/collection`)
			.json({ fromCollectionId: source.id, toCollectionId: foreignTarget.id })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(422);
	});

	test('should reject when the link is not in the source collection', async ({
		client,
	}) => {
		const user = await createUser();
		const source = await createCollection({ author: user, name: 'Source' });
		const target = await createCollection({ author: user, name: 'Target' });
		const link = await createLink({ author: user, name: 'Elsewhere' });
		await attachLinkToCollection(link, target);

		const response = await client
			.put(`/api/v1/links/${link.id}/collection`)
			.json({ fromCollectionId: source.id, toCollectionId: target.id })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(409);
	});
});

test.group('API add link to collection', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should attach without detaching from the source', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const source = await createCollection({ author: user, name: 'Source' });
		const target = await createCollection({ author: user, name: 'Target' });
		const link = await createLink({ author: user, name: 'Multi-homed' });
		await attachLinkToCollection(link, source);

		const response = await client
			.post(`/api/v1/links/${link.id}/collections`)
			.json({ collectionId: target.id })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);

		const pivotRows = await db
			.from('collection_link')
			.where('link_id', link.id);
		assert.sameMembers(
			pivotRows.map((row) => row.collection_id),
			[source.id, target.id]
		);
	});

	test('should reject a foreign collection', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'api-add-owner' });
		const stranger = await createUser({ emailPrefix: 'api-add-stranger' });
		const link = await createLink({ author: user, name: 'Mine' });
		const foreignCollection = await createCollection({
			author: stranger,
			name: 'Theirs',
		});

		const response = await client
			.post(`/api/v1/links/${link.id}/collections`)
			.json({ collectionId: foreignCollection.id })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(422);
	});
});
