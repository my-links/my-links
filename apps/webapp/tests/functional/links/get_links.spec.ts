import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import Link from '#models/link';
import { createUser } from '#tests/factories/user_factory';

test.group('Get links', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should redirect an unauthenticated request to login', async ({
		client,
	}) => {
		const response = await client.get('/links').redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});

	test("should only return the authenticated user's links", async ({
		client,
	}) => {
		const owner = await createUser();
		const stranger = await createUser();

		await Link.create({
			name: 'My link',
			description: null,
			url: 'https://example.com/mine',
			favorite: false,
			authorId: owner.id,
		});
		await Link.create({
			name: "Stranger's link",
			description: null,
			url: 'https://example.com/theirs',
			favorite: false,
			authorId: stranger.id,
		});

		const response = await client.get('/links').loginAs(owner);

		response.assertStatus(200);
		response.assertBodyContains({ data: [{ name: 'My link' }] });
		response.assertBodyNotContains({ data: [{ name: "Stranger's link" }] });
	});
});
