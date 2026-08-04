import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import { createUser } from '#tests/factories/user_factory';
import { createCollection } from '#tests/factories/collection_factory';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';

test.group('Add link to collection', (group) => {
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
			.post(`/links/${link.id}/collections`)
			.json({ collectionId: target.id })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);

		const pivotRows = await db
			.from('collection_link')
			.where('link_id', link.id);
		assert.sameMembers(
			pivotRows.map((row) => row.collection_id),
			[source.id, target.id]
		);
	});

	test('should be idempotent when the link is already in the target', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const collection = await createCollection({ author: user, name: 'Work' });
		const link = await createLink({ author: user, name: 'Already there' });
		await attachLinkToCollection(link, collection);

		const response = await client
			.post(`/links/${link.id}/collections`)
			.json({ collectionId: collection.id })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);

		const pivotRows = await db
			.from('collection_link')
			.where('link_id', link.id)
			.andWhere('collection_id', collection.id);
		assert.lengthOf(pivotRows, 1);
	});

	test('should reject a foreign collection', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'add-owner' });
		const stranger = await createUser({ emailPrefix: 'add-stranger' });
		const link = await createLink({ author: user, name: 'Mine' });
		const foreignCollection = await createCollection({
			author: stranger,
			name: 'Theirs',
		});

		const response = await client
			.post(`/links/${link.id}/collections`)
			.json({ collectionId: foreignCollection.id })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(422);
	});

	test('should reject a link belonging to another user', async ({ client }) => {
		const owner = await createUser({ emailPrefix: 'add-link-owner' });
		const intruder = await createUser({ emailPrefix: 'add-link-intruder' });
		const link = await createLink({ author: owner, name: 'Not yours' });
		const collection = await createCollection({
			author: intruder,
			name: 'Mine',
		});

		const response = await client
			.post(`/links/${link.id}/collections`)
			.json({ collectionId: collection.id })
			.withCsrfToken()
			.loginAs(intruder)
			.redirects(0);

		response.assertStatus(422);
	});
});
