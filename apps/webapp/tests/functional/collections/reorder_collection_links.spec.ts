import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import { Visibility } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { inertiaPageProps } from '#tests/helpers/inertia_page';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';
import {
	createCollection,
	followCollection,
} from '#tests/factories/collection_factory';

test.group('Reorder collection links', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should persist the link order for the author', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const collection = await createCollection({ author: user, name: 'Work' });
		const first = await createLink({ author: user, name: 'First' });
		const second = await createLink({ author: user, name: 'Second' });
		await attachLinkToCollection(first, collection);
		await attachLinkToCollection(second, collection);

		const response = await client
			.put(`/collections/${collection.id}/links/reorder`)
			.json({ linkIds: [second.id, first.id] })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);

		const rows = await db
			.from('collection_link')
			.where('collection_id', collection.id)
			.orderBy('position', 'asc');
		assert.deepEqual(
			rows.map((row) => row.link_id),
			[second.id, first.id]
		);
	});

	test('should reject a follower reordering links in a collection they follow', async ({
		client,
	}) => {
		const owner = await createUser({ emailPrefix: 'reorder-links-404-owner' });
		const follower = await createUser({
			emailPrefix: 'reorder-links-404-follower',
		});
		const collection = await createCollection({
			author: owner,
			name: 'Shared',
			visibility: Visibility.PUBLIC,
		});
		const link = await createLink({ author: owner, name: 'Link' });
		await attachLinkToCollection(link, collection);
		await followCollection(collection, follower);

		const response = await client
			.put(`/collections/${collection.id}/links/reorder`)
			.json({ linkIds: [link.id] })
			.withCsrfToken()
			.loginAs(follower)
			.redirects(0);

		// Session requests get bounced to favorites on a missing row rather
		// than a raw 404 — see HttpExceptionHandler#handle.
		response.assertStatus(302);
		response.assertHeader('location', '/collections/favorites');
	});

	test('should reject a link that is not in the collection', async ({
		client,
	}) => {
		const user = await createUser();
		const collection = await createCollection({ author: user, name: 'Work' });
		const inCollection = await createLink({ author: user, name: 'In' });
		await attachLinkToCollection(inCollection, collection);
		const outsideLink = await createLink({ author: user, name: 'Outside' });

		const response = await client
			.put(`/collections/${collection.id}/links/reorder`)
			.json({ linkIds: [inCollection.id, outsideLink.id] })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(409);
	});

	test('should mark the reordered links as changed on the sync feed', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const collection = await createCollection({ author: user, name: 'Work' });
		const first = await createLink({ author: user, name: 'First' });
		const second = await createLink({ author: user, name: 'Second' });
		await attachLinkToCollection(first, collection);
		await attachLinkToCollection(second, collection);
		await db
			.from('links')
			.whereIn('id', [first.id, second.id])
			.update({ updated_at: DateTime.now().minus({ hours: 1 }).toJSDate() });

		await client
			.put(`/collections/${collection.id}/links/reorder`)
			.json({ linkIds: [second.id, first.id] })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const response = await client
			.get('/api/v1/sync')
			.qs({ since: DateTime.now().minus({ minutes: 1 }).toString() })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(200);
		assert.sameMembers(
			response.body().links.map((link: { id: number }) => link.id),
			[first.id, second.id]
		);
	});

	test("should serve the author's link order to a follower viewing the collection", async ({
		client,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'reorder-links-view-owner' });
		const follower = await createUser({
			emailPrefix: 'reorder-links-view-follower',
		});
		const collection = await createCollection({
			author: owner,
			name: 'Shared',
			visibility: Visibility.PUBLIC,
		});
		const first = await createLink({ author: owner, name: 'First' });
		const second = await createLink({ author: owner, name: 'Second' });
		await attachLinkToCollection(first, collection);
		await attachLinkToCollection(second, collection);
		await followCollection(collection, follower);

		await client
			.put(`/collections/${collection.id}/links/reorder`)
			.json({ linkIds: [second.id, first.id] })
			.withCsrfToken()
			.loginAs(owner)
			.redirects(0);

		const response = await client
			.get(`/collections/${collection.id}`)
			.withInertia()
			.loginAs(follower);

		const props = inertiaPageProps(response) as {
			activeCollection: { links: Array<{ id: number }> };
		};
		assert.deepEqual(
			props.activeCollection.links.map((link) => link.id),
			[second.id, first.id]
		);
	});
});
