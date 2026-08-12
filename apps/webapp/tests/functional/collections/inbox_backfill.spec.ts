import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import type User from '#models/user';
import Collection from '#models/collection';
import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';
import {
	createInbox,
	createCollection,
	followCollection,
} from '#tests/factories/collection_factory';
import {
	makeInboxesPrivate,
	backfillMissingInboxCollections,
	revertMissingInboxCollectionsBackfill,
} from '#database/backfills/inbox_backfill';

function inboxesOf(user: User) {
	return Collection.query()
		.where('author_id', user.id)
		.andWhere('is_default', true);
}

test.group('Inbox backfill', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should open an Inbox for an account that has none', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-backfill' });

		await backfillMissingInboxCollections(db.connection());

		const inboxes = await inboxesOf(user);
		assert.lengthOf(inboxes, 1);
	});

	test('should file the new Inbox as a private collection', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-backfill' });

		await backfillMissingInboxCollections(db.connection());

		const [inbox] = await inboxesOf(user);
		assert.equal(inbox.visibility, VISIBILITY.PRIVATE);
	});

	test('should leave an account that already has an Inbox untouched', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-backfill' });
		const existingInbox = await createInbox(user);

		await backfillMissingInboxCollections(db.connection());

		const inboxes = await inboxesOf(user);
		assert.deepEqual(
			inboxes.map((inbox) => inbox.id),
			[existingInbox.id]
		);
	});

	test('should stay idempotent when it runs twice', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'inbox-backfill' });

		await backfillMissingInboxCollections(db.connection());
		await backfillMissingInboxCollections(db.connection());

		const inboxes = await inboxesOf(user);
		assert.lengthOf(inboxes, 1);
	});

	test('should close an Inbox an instance had shared', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'inbox-backfill' });
		const inbox = await createInbox(user);
		await db
			.from('collections')
			.where('id', inbox.id)
			.update({ visibility: VISIBILITY.PUBLIC });

		await makeInboxesPrivate(db.connection());

		const closed = await Collection.findOrFail(inbox.id);
		assert.equal(closed.visibility, VISIBILITY.PRIVATE);
	});

	test('should drop the followers a shared Inbox had handed out', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-backfill' });
		const follower = await createUser({ emailPrefix: 'inbox-backfill-fan' });
		const inbox = await createInbox(user);
		await db
			.from('collections')
			.where('id', inbox.id)
			.update({ visibility: VISIBILITY.PUBLIC });
		await followCollection(inbox, follower);

		await makeInboxesPrivate(db.connection());

		const followers = await db
			.from('collection_followers')
			.where('collection_id', inbox.id);
		assert.isEmpty(followers);
	});

	test('should leave an ordinary public collection shared', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-backfill' });
		const shared = await createCollection({
			author: user,
			name: 'Shared',
			visibility: VISIBILITY.PUBLIC,
		});

		await makeInboxesPrivate(db.connection());

		const untouched = await Collection.findOrFail(shared.id);
		assert.equal(untouched.visibility, VISIBILITY.PUBLIC);
	});

	test('should drop an empty Inbox on rollback', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'inbox-backfill' });
		await backfillMissingInboxCollections(db.connection());

		await revertMissingInboxCollectionsBackfill(db.connection());

		const inboxes = await inboxesOf(user);
		assert.isEmpty(inboxes);
	});

	test('should keep an Inbox holding links on rollback', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'inbox-backfill' });
		const inbox = await createInbox(user);
		const link = await createLink({ author: user });
		await attachLinkToCollection(link, inbox);

		await revertMissingInboxCollectionsBackfill(db.connection());

		const inboxes = await inboxesOf(user);
		assert.deepEqual(
			inboxes.map((remaining) => remaining.id),
			[inbox.id]
		);
	});
});
