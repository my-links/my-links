import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import {
	createInbox,
	followCollection,
} from '#tests/factories/collection_factory';

/**
 * The sidebar builds its ordered sections per visibility and pins the Inbox
 * outside them, so a public Inbox would be drawn twice and would make every
 * reorder of the public section fail as incomplete.
 */
test.group('Inbox visibility', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should refuse to make the Inbox public', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'inbox-visibility' });
		const inbox = await createInbox(user);

		const response = await client
			.put(`/collections/${inbox.id}`)
			.json({
				name: inbox.name,
				description: null,
				visibility: Visibility.PUBLIC,
				icon: null,
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(400);
	});

	test('should leave the Inbox private after a refused change', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-visibility' });
		const inbox = await createInbox(user);

		await client
			.put(`/collections/${inbox.id}`)
			.json({
				name: inbox.name,
				description: null,
				visibility: Visibility.PUBLIC,
				icon: null,
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const unchanged = await Collection.findOrFail(inbox.id);
		assert.equal(unchanged.visibility, Visibility.PRIVATE);
	});

	test('should let an Inbox shared before the rule go back to private', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-visibility' });
		const inbox = await createInbox(user);
		await db
			.from('collections')
			.where('id', inbox.id)
			.update({ visibility: Visibility.PUBLIC });

		await client
			.put(`/collections/${inbox.id}`)
			.json({
				name: inbox.name,
				description: null,
				visibility: Visibility.PRIVATE,
				icon: null,
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const closed = await Collection.findOrFail(inbox.id);
		assert.equal(closed.visibility, Visibility.PRIVATE);
	});

	test('should drop the followers when a shared Inbox goes back to private', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-visibility' });
		const follower = await createUser({ emailPrefix: 'inbox-follower' });
		const inbox = await createInbox(user);
		await db
			.from('collections')
			.where('id', inbox.id)
			.update({ visibility: Visibility.PUBLIC });
		await followCollection(inbox, follower);

		await client
			.put(`/collections/${inbox.id}`)
			.json({
				name: inbox.name,
				description: null,
				visibility: Visibility.PRIVATE,
				icon: null,
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const followers = await db
			.from('collection_followers')
			.where('collection_id', inbox.id);
		assert.isEmpty(followers);
	});

	test('should still accept a rename of the Inbox', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-visibility' });
		const inbox = await createInbox(user);

		await client
			.put(`/collections/${inbox.id}`)
			.json({
				name: 'Later',
				description: null,
				visibility: Visibility.PRIVATE,
				icon: null,
			})
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const renamed = await Collection.findOrFail(inbox.id);
		assert.equal(renamed.name, 'Later');
	});
});
