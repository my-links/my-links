import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';
import AuditEvent from '#models/audit_event';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { createCollection } from '#tests/factories/collection_factory';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';

async function createLinkIn(user: User, collection: Collection, name: string) {
	const link = await createLink({ author: user, name });
	await attachLinkToCollection(link, collection);
	return link;
}

function activityRowsFor(userId: number, type: string) {
	return AuditEvent.query().where('userId', userId).andWhere('type', type);
}

test.group('Link activity journal', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should journal creation with the link id, never its name or url', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'activity-link-create' });

		await client
			.post('/links')
			.json({
				name: 'Secret project',
				url: 'https://example.com/secret',
				favorite: false,
				collectionIds: [],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const link = await Link.query().where('author_id', user.id).firstOrFail();
		const event = await activityRowsFor(
			user.id,
			ACTIVITY_EVENT_TYPE.LINK_CREATED
		).firstOrFail();

		assert.equal(event.subjectType, AUDIT_SUBJECT_TYPE.LINK);
		assert.equal(event.subjectId, link.id);
		const serializedMetadata = JSON.stringify(event.metadata ?? {});
		assert.notInclude(serializedMetadata, 'Secret project');
		assert.notInclude(serializedMetadata, 'example.com');
	});

	test('should journal the auto-created Inbox as its own row', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'activity-link-inbox' });

		await client
			.post('/links')
			.json({
				name: 'No collection',
				url: 'https://example.com',
				favorite: false,
				collectionIds: [],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const inboxEvent = await activityRowsFor(
			user.id,
			ACTIVITY_EVENT_TYPE.COLLECTION_CREATED
		).firstOrFail();
		assert.deepEqual(inboxEvent.metadata, { automatic: true });
	});

	test('should journal an update', async ({ client, assert }) => {
		const user = await createUser({ emailPrefix: 'activity-link-update' });
		const collection = await createCollection({ author: user, name: 'Work' });
		const link = await createLinkIn(user, collection, 'Original name');

		await client
			.put(`/links/${link.id}`)
			.json({
				name: 'Renamed',
				url: 'https://example.com',
				favorite: false,
				collectionIds: [collection.id],
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const event = await activityRowsFor(
			user.id,
			ACTIVITY_EVENT_TYPE.LINK_UPDATED
		).firstOrFail();
		assert.equal(event.subjectId, link.id);
	});

	test('should journal a deletion', async ({ client, assert }) => {
		const user = await createUser({ emailPrefix: 'activity-link-delete' });
		const collection = await createCollection({ author: user, name: 'Work' });
		const link = await createLinkIn(user, collection, 'Doomed');

		await client
			.delete(`/links/${link.id}`)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const event = await activityRowsFor(
			user.id,
			ACTIVITY_EVENT_TYPE.LINK_DELETED
		).firstOrFail();
		assert.equal(event.subjectId, link.id);
	});

	test('should stay silent when deleting a link that does not belong to the caller', async ({
		client,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'activity-link-owner' });
		const intruder = await createUser({
			emailPrefix: 'activity-link-intruder',
		});
		const collection = await createCollection({ author: owner, name: 'Work' });
		const link = await createLinkIn(owner, collection, 'Not yours');

		await client
			.delete(`/links/${link.id}`)
			.withCsrfToken()
			.loginAs(intruder)
			.redirects(0);

		const events = await activityRowsFor(
			intruder.id,
			ACTIVITY_EVENT_TYPE.LINK_DELETED
		);
		assert.lengthOf(events, 0);
	});

	test('should journal a favourite toggle with its new state', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'activity-link-favorite' });
		const collection = await createCollection({ author: user, name: 'Work' });
		const link = await createLinkIn(user, collection, 'Pin me');

		await client
			.put(`/links/${link.id}/favorite`)
			.form({ favorite: true })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const event = await activityRowsFor(
			user.id,
			ACTIVITY_EVENT_TYPE.LINK_FAVORITE_TOGGLED
		).firstOrFail();
		assert.equal(event.subjectId, link.id);
		assert.deepEqual(event.metadata, { favorite: true });
	});
});

test.group('Collection activity journal', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should journal creation, never the collection name', async ({
		client,
		assert,
	}) => {
		const user = await createUser({
			emailPrefix: 'activity-collection-create',
		});

		await client
			.post('/collections')
			.json({
				name: 'Reading list',
				description: null,
				visibility: VISIBILITY.PRIVATE,
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const collection = await Collection.query()
			.where('author_id', user.id)
			.firstOrFail();
		const event = await activityRowsFor(
			user.id,
			ACTIVITY_EVENT_TYPE.COLLECTION_CREATED
		).firstOrFail();

		assert.equal(event.subjectType, AUDIT_SUBJECT_TYPE.COLLECTION);
		assert.equal(event.subjectId, collection.id);
		assert.isNull(event.metadata);
	});

	test('should journal an update', async ({ client, assert }) => {
		const user = await createUser({
			emailPrefix: 'activity-collection-update',
		});
		const collection = await createCollection({ author: user, name: 'Work' });

		await client
			.put(`/collections/${collection.id}`)
			.json({
				name: 'Renamed',
				description: null,
				visibility: VISIBILITY.PRIVATE,
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const event = await activityRowsFor(
			user.id,
			ACTIVITY_EVENT_TYPE.COLLECTION_UPDATED
		).firstOrFail();
		assert.equal(event.subjectId, collection.id);
	});

	test('should journal a deletion with the orphaned link count', async ({
		client,
		assert,
	}) => {
		const user = await createUser({
			emailPrefix: 'activity-collection-delete',
		});
		const collection = await createCollection({ author: user, name: 'Work' });
		await createLinkIn(user, collection, 'Homeless soon');

		await client
			.delete(`/collections/${collection.id}`)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const event = await activityRowsFor(
			user.id,
			ACTIVITY_EVENT_TYPE.COLLECTION_DELETED
		).firstOrFail();
		assert.equal(event.subjectId, collection.id);
		assert.deepEqual(event.metadata, { orphanedLinks: 1 });
	});

	test('should journal following and unfollowing', async ({
		client,
		assert,
	}) => {
		const owner = await createUser({
			emailPrefix: 'activity-collection-owner',
		});
		const follower = await createUser({
			emailPrefix: 'activity-collection-follower',
		});
		const collection = await createCollection({
			author: owner,
			name: 'Public reads',
		});
		collection.visibility = VISIBILITY.PUBLIC;
		await collection.save();

		await client
			.post(`/collections/${collection.id}/follow`)
			.withCsrfToken()
			.loginAs(follower)
			.redirects(0);

		const followedEvent = await activityRowsFor(
			follower.id,
			ACTIVITY_EVENT_TYPE.COLLECTION_FOLLOWED
		).firstOrFail();
		assert.equal(followedEvent.subjectId, collection.id);

		await client
			.post(`/collections/${collection.id}/unfollow`)
			.withCsrfToken()
			.loginAs(follower)
			.redirects(0);

		const unfollowedEvent = await activityRowsFor(
			follower.id,
			ACTIVITY_EVENT_TYPE.COLLECTION_UNFOLLOWED
		).firstOrFail();
		assert.equal(unfollowedEvent.subjectId, collection.id);
	});
});
