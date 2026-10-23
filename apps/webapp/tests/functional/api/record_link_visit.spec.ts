import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { TOKEN_ABILITY } from '#constants/api_token';
import { VISIBILITY, type Visibility } from '#enums/collections/visibility';
import Collection from '#models/collection';
import Link from '#models/link';
import type User from '#models/user';
import { createUser } from '#tests/factories/user_factory';

const HTTP_NO_CONTENT = 204;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;

async function createLinkIn(author: User, visibility: Visibility) {
	const collection = await Collection.create({
		name: `Collection ${visibility}`,
		description: null,
		visibility,
		icon: null,
		authorId: author.id,
	});
	const link = await Link.create({
		name: 'Target link',
		description: null,
		url: 'https://example.com/target',
		favorite: false,
		authorId: author.id,
	});
	await link.related('collections').attach([collection.id]);
	return link;
}

test.group('API record link visit', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 204 when the owner records a visit', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'visit-owner-status' });
		const link = await createLinkIn(user, VISIBILITY.PRIVATE);

		const response = await client
			.post(`/api/v1/links/${link.id}/visits`)
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(HTTP_NO_CONTENT);
	});

	test('should count the click when the owner records a visit', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'visit-owner-count' });
		const link = await createLinkIn(user, VISIBILITY.PRIVATE);

		await client
			.post(`/api/v1/links/${link.id}/visits`)
			.withGuard('api')
			.loginAs(user);

		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 1);
		assert.isNotNull(visited.lastClickedAt);
	});

	test('should answer 204 without counting the click when the link is in another user public collection', async ({
		client,
		assert,
	}) => {
		const author = await createUser({ emailPrefix: 'visit-public-author' });
		const follower = await createUser({ emailPrefix: 'visit-public-follower' });
		const link = await createLinkIn(author, VISIBILITY.PUBLIC);

		const response = await client
			.post(`/api/v1/links/${link.id}/visits`)
			.withGuard('api')
			.loginAs(follower);

		response.assertStatus(HTTP_NO_CONTENT);
		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 0);
	});

	test('should answer 404 and not count the click when the link is private and owned by someone else', async ({
		client,
		assert,
	}) => {
		const author = await createUser({ emailPrefix: 'visit-private-author' });
		const stranger = await createUser({
			emailPrefix: 'visit-private-stranger',
		});
		const link = await createLinkIn(author, VISIBILITY.PRIVATE);

		const response = await client
			.post(`/api/v1/links/${link.id}/visits`)
			.withGuard('api')
			.loginAs(stranger);

		response.assertStatus(HTTP_NOT_FOUND);
		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 0);
	});

	test('should not change updated_at when a visit is recorded', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'visit-updated-at' });
		const link = await createLinkIn(user, VISIBILITY.PRIVATE);
		const updatedAtBeforeVisit = link.updatedAt?.toMillis();

		await client
			.post(`/api/v1/links/${link.id}/visits`)
			.withGuard('api')
			.loginAs(user);

		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.updatedAt?.toMillis(), updatedAtBeforeVisit);
	});

	test('should answer 403 and not count the click when the token is read-only', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'visit-read-only' });
		const link = await createLinkIn(user, VISIBILITY.PRIVATE);

		const response = await client
			.post(`/api/v1/links/${link.id}/visits`)
			.withGuard('api')
			.loginAs(user, [TOKEN_ABILITY.READ]);

		response.assertStatus(HTTP_FORBIDDEN);
		const visited = await Link.findOrFail(link.id);
		assert.equal(visited.clicks, 0);
	});
});
