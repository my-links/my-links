import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';
import { createUser } from '#tests/factories/user_factory';
import { VISIBILITY, type Visibility } from '#enums/collections/visibility';

function assertNotNull<TValue>(
	value: TValue
): asserts value is NonNullable<TValue> {
	if (value === null) throw new Error('Expected value not to be null');
}

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
		const link = await createLinkIn(user, VISIBILITY.PRIVATE);

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
		const link = await createLinkIn(user, VISIBILITY.PRIVATE);
		assertNotNull(link.updatedAt);
		const updatedAtBeforeVisit = link.updatedAt.toMillis();

		await client.get(`/l/${link.id}`).loginAs(user).redirects(0);

		const visited = await Link.findOrFail(link.id);
		assertNotNull(visited.updatedAt);
		assert.equal(visited.updatedAt.toMillis(), updatedAtBeforeVisit);
	});

	test('should let an anonymous visitor follow a link in a public collection without counting the click', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const link = await createLinkIn(user, VISIBILITY.PUBLIC);

		const response = await client.get(`/l/${link.id}`).redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', 'https://example.com/target');
		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 0);
	});

	test('should let another user follow a public link without counting the click', async ({
		client,
		assert,
	}) => {
		const owner = await createUser();
		const otherUser = await createUser();
		const link = await createLinkIn(owner, VISIBILITY.PUBLIC);

		const response = await client
			.get(`/l/${link.id}`)
			.loginAs(otherUser)
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', 'https://example.com/target');
		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 0);
	});

	test('should not disclose a private link to someone who does not own it', async ({
		client,
		assert,
	}) => {
		const owner = await createUser();
		const stranger = await createUser();
		const link = await createLinkIn(owner, VISIBILITY.PRIVATE);

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

test.group('Link visit recording', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 204 when the owner records a visit', async ({
		client,
	}) => {
		const user = await createUser();
		const link = await createLinkIn(user, VISIBILITY.PRIVATE);

		const response = await client
			.post(`/l/${link.id}`)
			.withCsrfToken()
			.loginAs(user);

		response.assertStatus(204);
	});

	test('should count the click when the owner records a visit', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const link = await createLinkIn(user, VISIBILITY.PRIVATE);

		await client.post(`/l/${link.id}`).withCsrfToken().loginAs(user);

		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 1);
		assert.isNotNull(visited.lastClickedAt);
	});

	test('should not change updated_at when a visit is recorded', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const link = await createLinkIn(user, VISIBILITY.PRIVATE);
		assertNotNull(link.updatedAt);
		const updatedAtBeforeVisit = link.updatedAt.toMillis();

		await client.post(`/l/${link.id}`).withCsrfToken().loginAs(user);

		const visited = await Link.findOrFail(link.id);
		assertNotNull(visited.updatedAt);
		assert.equal(visited.updatedAt.toMillis(), updatedAtBeforeVisit);
	});

	test('should answer 204 without counting the click when an anonymous visitor records a visit on a public collection link', async ({
		client,
		assert,
	}) => {
		const user = await createUser();
		const link = await createLinkIn(user, VISIBILITY.PUBLIC);

		const response = await client.post(`/l/${link.id}`).withCsrfToken();

		response.assertStatus(204);
		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 0);
	});

	test('should answer 204 without counting the click when another user records a visit on a public link', async ({
		client,
		assert,
	}) => {
		const owner = await createUser();
		const otherUser = await createUser();
		const link = await createLinkIn(owner, VISIBILITY.PUBLIC);

		const response = await client
			.post(`/l/${link.id}`)
			.withCsrfToken()
			.loginAs(otherUser);

		response.assertStatus(204);
		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 0);
	});

	test('should not count the click when someone records a visit on a private link they do not own', async ({
		client,
		assert,
	}) => {
		const owner = await createUser();
		const stranger = await createUser();
		const link = await createLinkIn(owner, VISIBILITY.PRIVATE);

		await client
			.post(`/l/${link.id}`)
			.withCsrfToken()
			.loginAs(stranger)
			.redirects(0);

		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 0);
	});
});
