import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';

async function createLinkIn(user: User, visibility: Visibility) {
	const collection = await Collection.create({
		name: `Collection ${visibility}`,
		description: null,
		visibility,
		icon: null,
		authorId: user.id,
	});
	const link = await Link.create({
		name: 'Target link',
		description: null,
		url: 'https://example.com/target',
		favorite: false,
		authorId: user.id,
	});
	await link.related('collections').attach([collection.id]);
	return link;
}

test.group('Link visit redirect', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should redirect to the target URL and count the click', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const link = await createLinkIn(user, Visibility.PRIVATE);

		const response = await client
			.get(`/l/${link.id}`)
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', 'https://example.com/target');

		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 1);
		assert.isNotNull(visited.lastClickedAt);
	});

	test('should not change updated_at when a link is visited', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const link = await createLinkIn(user, Visibility.PRIVATE);
		const updatedAtBeforeVisit = link.updatedAt.toMillis();

		await client.get(`/l/${link.id}`).loginAs(user).redirects(0);

		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.updatedAt.toMillis(), updatedAtBeforeVisit);
	});

	test('should let an anonymous visitor follow a link in a public collection', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const link = await createLinkIn(user, Visibility.PUBLIC);

		const response = await client.get(`/l/${link.id}`).redirects(0);

		response.assertStatus(302);
		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 1);
	});

	test('should not disclose a private link to someone who does not own it', async ({
		client,
		assert,
	}) => {
		const owner = await createUser();
		const stranger = await createUser();
		const link = await createLinkIn(owner, Visibility.PRIVATE);

		const response = await client
			.get(`/l/${link.id}`)
			.loginAs(stranger)
			.redirects(0);

		// The app's exception handler turns a missing row into a redirect back
		// to the dashboard, so "denied" shows up as landing anywhere but the
		// link's own target.
		assert.notEqual(response.header('location'), 'https://example.com/target');
		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 0);
	});
});
