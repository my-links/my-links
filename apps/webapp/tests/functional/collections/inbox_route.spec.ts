import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import Collection from '#models/collection';
import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { inertiaPageProps } from '#tests/helpers/inertia_page';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';
import {
	createInbox,
	createCollection,
	followCollection,
} from '#tests/factories/collection_factory';

const INBOX_PATH = '/collections/inbox';

/**
 * The Inbox is one fixed place per account, so it answers on a named route
 * rather than on the id of a collection the user never made.
 */
test.group('Inbox route', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should open the Inbox as the active collection', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-route' });
		const inbox = await createInbox(user);

		const response = await client.get(INBOX_PATH).withInertia().loginAs(user);

		const { activeCollection } = inertiaPageProps(response);
		assert.equal(activeCollection.id, inbox.id);
	});

	test('should list the links filed in the Inbox', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-route' });
		const inbox = await createInbox(user);
		const link = await createLink({ author: user, name: 'Filed link' });
		await attachLinkToCollection(link, inbox);

		const response = await client.get(INBOX_PATH).withInertia().loginAs(user);

		const { activeCollection } = inertiaPageProps(response);
		assert.deepEqual(
			activeCollection.links.map((filed: { id: number }) => filed.id),
			[link.id]
		);
	});

	test('should open an Inbox for an account that has none', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-route' });

		const response = await client.get(INBOX_PATH).withInertia().loginAs(user);

		const inbox = await Collection.query()
			.where('author_id', user.id)
			.andWhere('is_default', true)
			.firstOrFail();
		const { activeCollection } = inertiaPageProps(response);
		assert.equal(activeCollection.id, inbox.id);
	});

	test('should redirect the Inbox id to the named route', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-route' });
		const inbox = await createInbox(user);

		const response = await client
			.get(`/collections/${inbox.id}`)
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', INBOX_PATH);
	});

	test('should leave an ordinary collection on its id route', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-route' });
		await createInbox(user);
		const collection = await createCollection({ author: user, name: 'A' });

		const response = await client
			.get(`/collections/${collection.id}`)
			.withInertia()
			.loginAs(user);

		const { activeCollection } = inertiaPageProps(response);
		assert.equal(activeCollection.id, collection.id);
	});

	test('should not redirect a followed collection that belongs to someone else', async ({
		assert,
		client,
	}) => {
		const owner = await createUser({ emailPrefix: 'inbox-route-owner' });
		const follower = await createUser({ emailPrefix: 'inbox-route-follower' });
		const shared = await createCollection({
			author: owner,
			name: 'Shared',
			visibility: VISIBILITY.PUBLIC,
		});
		await followCollection(shared, follower);

		const response = await client
			.get(`/collections/${shared.id}`)
			.withInertia()
			.loginAs(follower);

		const { activeCollection } = inertiaPageProps(response);
		assert.equal(activeCollection.id, shared.id);
	});

	test('should refuse the Inbox to a signed out visitor', async ({
		client,
	}) => {
		const response = await client.get(INBOX_PATH).redirects(0);

		response.assertStatus(302);
	});
});
