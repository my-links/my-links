import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import { createUser } from '#tests/factories/user_factory';

const SUDO_PATH = '/sudo';
const API_TOKENS_PATH = '/user/api-tokens';
const DELETE_ACCOUNT_PATH = '/user/settings/account';
const HOME_PATH = '/';

const ADMIN_WRITE_ROUTES = [
	{ method: 'post', path: '/admin/users/bulk-delete' },
	{ method: 'post', path: '/admin/users/1/password-reset' },
	{ method: 'post', path: '/admin/users/1/revoke-access' },
	{ method: 'post', path: '/admin/users/1/verify-email' },
	{ method: 'patch', path: '/admin/users/1/role' },
	{ method: 'post', path: '/admin/users/1/restore' },
	{ method: 'post', path: '/admin/favicons/purge-orphans' },
	{ method: 'post', path: '/admin/favicons/flush' },
	{ method: 'post', path: '/admin/favicons/reresolve-failures' },
	{ method: 'post', path: '/admin/favicons/reresolve-all' },
] as const;

async function createAdministrator() {
	const administrator = await createUser({ emailPrefix: 'sudo-admin' });
	administrator.isAdmin = true;
	await administrator.save();

	return administrator;
}

test.group('Sudo mode: admin writes', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	for (const { method, path } of ADMIN_WRITE_ROUTES) {
		test(`should send an administrator with no recent proof to the prompt from ${method.toUpperCase()} ${path}`, async ({
			client,
		}) => {
			const administrator = await createAdministrator();

			const response = await client[method](path)
				.withCsrfToken()
				.loginAs(administrator)
				.redirects(0);

			response.assertHeader('location', SUDO_PATH);
		});
	}

	test('should refuse a member before asking for a proof', async ({
		client,
	}) => {
		const member = await createUser({ emailPrefix: 'sudo-member' });

		const response = await client
			.post('/admin/users/bulk-delete')
			.withCsrfToken()
			.loginAs(member)
			.redirects(0);

		response.assertHeader('location', HOME_PATH);
	});
});

test.group('Sudo mode: token creation and account deletion', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should send a user with no recent proof to the prompt when creating a token', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-token' });

		const response = await client
			.post(API_TOKENS_PATH)
			.form({ name: 'CI', scope: 'read_only', expiry: '30_days' })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertHeader('location', SUDO_PATH);
	});

	test('should send a user with no recent proof to the prompt when deleting the account', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-delete' });

		const response = await client
			.delete(DELETE_ACCOUNT_PATH)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertHeader('location', SUDO_PATH);
	});
});
