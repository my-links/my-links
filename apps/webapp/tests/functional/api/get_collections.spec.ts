import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

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

async function setFollowerPosition(
	collectionId: number,
	userId: number,
	position: number
) {
	await db
		.from('collection_followers')
		.where('collection_id', collectionId)
		.andWhere('user_id', userId)
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
			visibility: VISIBILITY.PRIVATE,
		});
		const privateB = await createCollection({
			author: user,
			name: 'B',
			visibility: VISIBILITY.PRIVATE,
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

test.group('API get collections — followed', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should list followed public collections, ordered by the follower’s position, marked as not owned', async ({
		client,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'followed-owner' });
		const follower = await createUser({ emailPrefix: 'followed-follower' });
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
		await followCollection(first, follower);
		await followCollection(second, follower);
		await setFollowerPosition(first.id, follower.id, 1);
		await setFollowerPosition(second.id, follower.id, 0);

		const response = await client
			.get('/api/v1/collections')
			.withGuard('api')
			.loginAs(follower);

		response.assertStatus(200);
		const followedCollections = (
			response.body() as {
				followedCollections: Array<{ id: number; isOwner: boolean }>;
			}
		).followedCollections;

		assert.deepEqual(
			followedCollections.map((collection) => collection.id),
			[second.id, first.id]
		);
		assert.isTrue(
			followedCollections.every((collection) => !collection.isOwner)
		);
	});

	test('should order a followed collection’s links by the author’s position, without exposing collection membership', async ({
		client,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'followed-links-owner' });
		const follower = await createUser({
			emailPrefix: 'followed-links-follower',
		});
		const collection = await createCollection({
			author: owner,
			name: 'Reading',
			visibility: VISIBILITY.PUBLIC,
		});
		const linkA = await createLink({
			author: owner,
			name: 'A',
			url: 'https://a.example.com',
		});
		const linkB = await createLink({
			author: owner,
			name: 'B',
			url: 'https://b.example.com',
		});
		await attachLinkToCollection(linkA, collection);
		await attachLinkToCollection(linkB, collection);
		await setLinkPosition(collection.id, linkA.id, 1);
		await setLinkPosition(collection.id, linkB.id, 0);
		await followCollection(collection, follower);

		const response = await client
			.get('/api/v1/collections')
			.withGuard('api')
			.loginAs(follower);

		response.assertStatus(200);
		const followedCollections = (
			response.body() as {
				followedCollections: Array<{
					id: number;
					links: Array<{ id: number; collectionIds?: number[] }>;
				}>;
			}
		).followedCollections;
		const match = followedCollections.find(
			(entry) => entry.id === collection.id
		);

		assert.deepEqual(
			match?.links.map((link) => link.id),
			[linkB.id, linkA.id]
		);
		assert.isUndefined(match?.links[0]?.collectionIds);
	});

	test('should exclude a collection that turned private after being followed', async ({
		client,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'followed-private-owner' });
		const follower = await createUser({
			emailPrefix: 'followed-private-follower',
		});
		const collection = await createCollection({
			author: owner,
			name: 'No longer public',
			visibility: VISIBILITY.PUBLIC,
		});
		await followCollection(collection, follower);
		await db
			.from('collections')
			.where('id', collection.id)
			.update({ visibility: VISIBILITY.PRIVATE });

		const response = await client
			.get('/api/v1/collections')
			.withGuard('api')
			.loginAs(follower);

		response.assertStatus(200);
		const followedCollections = (
			response.body() as { followedCollections: Array<{ id: number }> }
		).followedCollections;

		assert.isFalse(
			followedCollections.some((entry) => entry.id === collection.id)
		);
	});
});
