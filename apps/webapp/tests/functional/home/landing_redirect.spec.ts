import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import { createUser } from '#tests/factories/user_factory';
import { createLink } from '#tests/factories/link_factory';

const HOME_PATH = '/';
const FAVORITES_PATH = '/collections/favorites';
const INBOX_PATH = '/collections/inbox';

test.group('Landing redirect', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should redirect an authenticated user to the inbox when they have no favorite link', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'landing' });

		const response = await client.get(HOME_PATH).loginAs(user).redirects(0);

		response.assertHeader('location', INBOX_PATH);
	});

	test('should redirect an authenticated user to favorites when they have at least one favorite link', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'landing' });
		const link = await createLink({ author: user });
		link.favorite = true;
		await link.save();

		const response = await client.get(HOME_PATH).loginAs(user).redirects(0);

		response.assertHeader('location', FAVORITES_PATH);
	});

	test('should keep flash messages across the landing redirect', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'landing' });

		const response = await client
			.get(HOME_PATH)
			.withFlashMessages({ success: 'kept' })
			.loginAs(user)
			.redirects(0);

		response.assertFlashMessage('success', 'kept');
	});

	test('should render the favorites page when the user has no favorite link', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'landing' });

		const response = await client
			.get(FAVORITES_PATH)
			.withInertia()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(200);
	});
});
