import { test } from '@japa/runner';
import type { ApiClient } from '@japa/api-client';
import testUtils from '@adonisjs/core/services/test_utils';

import env from '#start/env';
import type User from '#models/user';
import { createUser } from '#tests/factories/user_factory';
import { SUDO_RETURN_URL_SESSION_KEY } from '#services/auth/sudo_mode_service';

const SUDO_PATH = '/sudo';
const SETTINGS_PATH = '/user/settings';
const SAME_ORIGIN = `http://${env.get('HOST')}:${env.get('PORT')}`;
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

test.group('Sudo mode: the return path of a refused submission', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	function refuseDeletionFrom(client: ApiClient, user: User, referer?: string) {
		const request = client
			.delete(DELETE_ACCOUNT_PATH)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		return referer ? request.header('referer', referer) : request;
	}

	test('should come back to the same-origin page the submission came from', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-return' });

		const response = await refuseDeletionFrom(
			client,
			user,
			`${SAME_ORIGIN}/admin?page=2`
		);

		response.assertSession(SUDO_RETURN_URL_SESSION_KEY, '/admin?page=2');
	});

	test('should drop the origin of the referer and keep only its path', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-return' });

		const response = await refuseDeletionFrom(
			client,
			user,
			`${SAME_ORIGIN}/admin#fragment`
		);

		response.assertSession(SUDO_RETURN_URL_SESSION_KEY, '/admin');
	});

	for (const referer of [
		'https://evil.example/x',
		'//evil.example/x',
		'\\\\evil.example\\x',
		`${SAME_ORIGIN}//evil.example/x`,
		`${SAME_ORIGIN}/\\evil.example/x`,
	]) {
		test(`should fall back to the settings page for the referer ${referer}`, async ({
			client,
		}) => {
			const user = await createUser({ emailPrefix: 'sudo-return' });

			const response = await refuseDeletionFrom(client, user, referer);

			response.assertSession(SUDO_RETURN_URL_SESSION_KEY, SETTINGS_PATH);
		});
	}

	test('should fall back to the settings page without a referer', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-return' });

		const response = await refuseDeletionFrom(client, user);

		response.assertSession(SUDO_RETURN_URL_SESSION_KEY, SETTINGS_PATH);
	});
});
