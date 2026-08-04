import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import Link from '#models/link';
import { createUser } from '#tests/factories/user_factory';
import { createCollection } from '#tests/factories/collection_factory';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';

async function linkUpdatedAt(linkId: number) {
	const link = await Link.findOrFail(linkId);
	return link.updatedAt;
}

test.group('Move link between collections', (group) => {
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
			.put(`/links/${link.id}/collection`)
			.json({ fromCollectionId: source.id, toCollectionId: target.id })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);

		const linkRows = await db.from('links').where('id', link.id);
		assert.lengthOf(linkRows, 1);

		const pivotRows = await db
			.from('collection_link')
			.where('link_id', link.id);
		assert.lengthOf(pivotRows, 1);
		assert.equal(pivotRows[0].collection_id, target.id);
	});

	test('should append at the end of the target collection', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const source = await createCollection({ author: user, name: 'Source' });
		const target = await createCollection({ author: user, name: 'Target' });
		const existingInTarget = await createLink({
			author: user,
			name: 'Already there',
		});
		await attachLinkToCollection(existingInTarget, target);
		const link = await createLink({ author: user, name: 'Moving' });
		await attachLinkToCollection(link, source);

		await client
			.put(`/links/${link.id}/collection`)
			.json({ fromCollectionId: source.id, toCollectionId: target.id })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const rows = await db
			.from('collection_link')
			.where('collection_id', target.id)
			.orderBy('position', 'asc');

		assert.deepEqual(
			rows.map((row) => row.link_id),
			[existingInTarget.id, link.id]
		);
	});

	test('should reject when either collection belongs to another user', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'move-owner' });
		const stranger = await createUser({ emailPrefix: 'move-stranger' });
		const source = await createCollection({ author: user, name: 'Source' });
		const foreignTarget = await createCollection({
			author: stranger,
			name: 'Theirs',
		});
		const link = await createLink({ author: user, name: 'Moving' });
		await attachLinkToCollection(link, source);

		const response = await client
			.put(`/links/${link.id}/collection`)
			.json({
				fromCollectionId: source.id,
				toCollectionId: foreignTarget.id,
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(422);
	});

	test('should reject when the link belongs to another user', async ({
		client,
	}) => {
		const owner = await createUser({ emailPrefix: 'move-link-owner' });
		const intruder = await createUser({ emailPrefix: 'move-link-intruder' });
		const source = await createCollection({ author: owner, name: 'Source' });
		const target = await createCollection({ author: owner, name: 'Target' });
		const link = await createLink({ author: owner, name: 'Not yours' });
		await attachLinkToCollection(link, source);

		const response = await client
			.put(`/links/${link.id}/collection`)
			.json({ fromCollectionId: source.id, toCollectionId: target.id })
			.withCsrfToken()
			.loginAs(intruder)
			.redirects(0);

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
			.put(`/links/${link.id}/collection`)
			.json({ fromCollectionId: source.id, toCollectionId: target.id })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(409);
	});

	test('should no-op when source equals target', async ({ client, assert }) => {
		const user = await createUser();
		const collection = await createCollection({ author: user, name: 'Same' });
		const link = await createLink({ author: user, name: 'Staying' });
		await attachLinkToCollection(link, collection);

		const response = await client
			.put(`/links/${link.id}/collection`)
			.json({ fromCollectionId: collection.id, toCollectionId: collection.id })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);

		const pivotRows = await db
			.from('collection_link')
			.where('link_id', link.id);
		assert.lengthOf(pivotRows, 1);
	});

	test('should bump links.updated_at', async ({ client, assert }) => {
		const user = await createUser();
		const source = await createCollection({ author: user, name: 'Source' });
		const target = await createCollection({ author: user, name: 'Target' });
		const link = await createLink({ author: user, name: 'Moving' });
		await attachLinkToCollection(link, source);
		const before = await linkUpdatedAt(link.id);

		await client
			.put(`/links/${link.id}/collection`)
			.json({ fromCollectionId: source.id, toCollectionId: target.id })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const after = await linkUpdatedAt(link.id);
		assert.isTrue((after?.toMillis() ?? 0) > (before?.toMillis() ?? 0));
	});
});
