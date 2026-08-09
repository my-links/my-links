import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import type User from '#models/user';
import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { createInbox } from '#tests/factories/collection_factory';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';
import {
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
		assert.equal(inbox.visibility, Visibility.PRIVATE);
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
