import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import { Visibility } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { createCollection } from '#tests/factories/collection_factory';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';

async function setCollectionPosition(collectionId: number, position: number) {
	await db.from('collections').where('id', collectionId).update({ position });
}

async function setLinkPosition(
	collectionId: number,
	linkId: number,
	position: number
) {
	await db
		.from('collection_link')
		.where('collection_id', collectionId)
		.andWhere('link_id', linkId)
		.update({ position });
}

test.group('API get collections — order', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should order collections by position within each visibility, ahead of name', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const privateA = await createCollection({
			author: user,
			name: 'A',
			visibility: Visibility.PRIVATE,
		});
		const privateB = await createCollection({
			author: user,
			name: 'B',
			visibility: Visibility.PRIVATE,
		});
		await setCollectionPosition(privateA.id, 1);
		await setCollectionPosition(privateB.id, 0);

		const response = await client
			.get('/api/v1/collections')
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);
		const collections = (response.body() as { data: Array<{ id: number }> })
			.data;
		const ownIds = collections
			.map((collection) => collection.id)
			.filter((id) => id === privateA.id || id === privateB.id);
		assert.deepEqual(ownIds, [privateB.id, privateA.id]);
	});

	test('should order a collection’s links by their pivot position, ahead of name', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const collection = await createCollection({
			author: user,
			name: 'Reading',
		});
		const linkA = await createLink({
			author: user,
			name: 'A',
			url: 'https://a.example.com',
		});
		const linkB = await createLink({
			author: user,
			name: 'B',
			url: 'https://b.example.com',
		});
		await attachLinkToCollection(linkA, collection);
		await attachLinkToCollection(linkB, collection);
		await setLinkPosition(collection.id, linkA.id, 1);
		await setLinkPosition(collection.id, linkB.id, 0);

		const response = await client
			.get('/api/v1/collections')
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);
		const collections = (
			response.body() as {
				data: Array<{ id: number; links: Array<{ id: number }> }>;
			}
		).data;
		const match = collections.find((entry) => entry.id === collection.id);
		assert.deepEqual(
			match?.links.map((link) => link.id),
			[linkB.id, linkA.id]
		);
	});
});
