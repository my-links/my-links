import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import { createUser } from '#tests/factories/user_factory';

const ADMIN_DASHBOARD_ROUTE = '/admin';
const FAVORITES_ROUTE = '/collections/favorites';
const REFUSED_MESSAGE = 'This area is reserved to administrators';

async function createAdmin(): Promise<User> {
	const user = await createUser({ emailPrefix: 'admin' });
	user.isAdmin = true;
	await user.save();

	return user;
}

test.group('Admin access', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should send a signed-in visitor without the admin flag back to their collections', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'not-admin' });

		const response = await client
			.get(ADMIN_DASHBOARD_ROUTE)
			.loginAs(user)
			.redirects(0);

		response.assertHeader('location', FAVORITES_ROUTE);
	});

	test('should tell the visitor why they were moved', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'not-admin' });

		const response = await client
			.get(ADMIN_DASHBOARD_ROUTE)
			.loginAs(user)
			.redirects(0);

		response.assertFlashMessage('error', REFUSED_MESSAGE);
	});

	test('should let an administrator through', async ({ client }) => {
		const admin = await createAdmin();

		const response = await client
			.get(ADMIN_DASHBOARD_ROUTE)
			.withInertia()
			.loginAs(admin);

		response.assertStatus(200);
		response.assertInertiaComponent('admin/dashboard');
	});
});
