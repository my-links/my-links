import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import Collection from '#models/collection';
import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { inertiaPageProps } from '#tests/helpers/inertia_page';
import {
	createInbox,
	createCollection,
} from '#tests/factories/collection_factory';

/**
 * The sidebar pins the Inbox above the sections the user orders, so the two
 * have to reach the page as separate props.
 */
test.group('Inbox sidebar props', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should keep the Inbox out of the private collections', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-props' });
		await createInbox(user);
		const collection = await createCollection({ author: user, name: 'A' });

		const response = await client
			.get(`/collections/${collection.id}`)
			.withInertia()
			.loginAs(user);

		const { myPrivateCollections } = inertiaPageProps(response);
		assert.deepEqual(
			myPrivateCollections.map(
				(privateCollection: { id: number }) => privateCollection.id
			),
			[collection.id]
		);
	});

	test('should send the Inbox as its own prop', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'inbox-props' });
		const inbox = await createInbox(user);
		const collection = await createCollection({ author: user, name: 'A' });

		const response = await client
			.get(`/collections/${collection.id}`)
			.withInertia()
			.loginAs(user);

		const { inboxCollection } = inertiaPageProps(response);
		assert.equal(inboxCollection.id, inbox.id);
	});

	test('should send the Inbox on the favorites page too', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-props' });
		const inbox = await createInbox(user);

		const response = await client
			.get('/collections/favorites')
			.withInertia()
			.loginAs(user);

		const { inboxCollection } = inertiaPageProps(response);
		assert.equal(inboxCollection.id, inbox.id);
	});

	test('should open an Inbox for an account that has none', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-props' });
		const collection = await createCollection({ author: user, name: 'A' });

		const response = await client
			.get(`/collections/${collection.id}`)
			.withInertia()
			.loginAs(user);

		const { inboxCollection } = inertiaPageProps(response);
		const inbox = await Collection.query()
			.where('author_id', user.id)
			.andWhere('is_default', true)
			.firstOrFail();
		assert.equal(inboxCollection.id, inbox.id);
	});

	test('should reuse the Inbox it opened on a later render', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-props' });
		const collection = await createCollection({ author: user, name: 'A' });

		await client
			.get(`/collections/${collection.id}`)
			.withInertia()
			.loginAs(user);
		await client
			.get(`/collections/${collection.id}`)
			.withInertia()
			.loginAs(user);

		const inboxes = await Collection.query()
			.where('author_id', user.id)
			.andWhere('is_default', true);
		assert.lengthOf(inboxes, 1);
	});

	test('should leave the public collections untouched', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'inbox-props' });
		await createInbox(user);
		const publicCollection = await createCollection({
			author: user,
			name: 'Public A',
			visibility: VISIBILITY.PUBLIC,
		});

		const response = await client
			.get(`/collections/${publicCollection.id}`)
			.withInertia()
			.loginAs(user);

		const { myPublicCollections } = inertiaPageProps(response);
		assert.deepEqual(
			myPublicCollections.map((collection: { id: number }) => collection.id),
			[publicCollection.id]
		);
	});
});
