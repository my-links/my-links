import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import AuditEvent from '#models/audit_event';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { nextClientAddress } from '#tests/helpers/client_addresses';
import { PENDING_REACTIVATION_SESSION_KEY } from '#services/auth/account_reactivation_service';
import {
	createUser,
	setUserPassword,
	requestAccountDeletion,
} from '#tests/factories/user_factory';

const VALID_PASSWORD = 'correct-horse-battery-staple';
const SESSION_GUARD_KEY = 'auth_web';
const REACTIVATE_PATH = '/reactivate';
const LOGIN_PATH = '/login';

function armedSession(user: User) {
	return {
		[PENDING_REACTIVATION_SESSION_KEY]: { userId: user.id, email: user.email },
	};
}

test.group('Account reactivation — login-time gate', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should redirect to the reactivation screen instead of opening a session', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'pending-deletion' });
		await setUserPassword(user, VALID_PASSWORD);
		await requestAccountDeletion(user);

		const response = await client
			.post(LOGIN_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		response.assertHeader('location', REACTIVATE_PATH);
		response.assertSessionMissing(SESSION_GUARD_KEY);
	});

	test('should arm the pending account in the session', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'pending-deletion-arm' });
		await setUserPassword(user, VALID_PASSWORD);
		await requestAccountDeletion(user);

		const response = await client
			.post(LOGIN_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		response.assertSession(PENDING_REACTIVATION_SESSION_KEY, {
			userId: user.id,
			email: user.email,
		});
	});

	test('should record a blocked-login event naming the account', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'pending-deletion-journal' });
		await setUserPassword(user, VALID_PASSWORD);
		await requestAccountDeletion(user);

		await client
			.post(LOGIN_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.orderBy('id', 'desc')
			.firstOrFail();
		assert.equal(event.type, AUTH_EVENT_TYPE.LOGIN_BLOCKED_PENDING_DELETION);
	});
});

test.group('Account reactivation — the prompt', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should render the reactivation page for the armed account', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reactivate-render' });

		const response = await client
			.get(REACTIVATE_PATH)
			.withInertia()
			.withSession(armedSession(user));

		response.assertInertiaComponent('auth/reactivate_account');
		response.assertInertiaPropsContains({ email: user.email });
	});

	test('should redirect to login when nothing is armed', async ({ client }) => {
		const response = await client.get(REACTIVATE_PATH).redirects(0);

		response.assertHeader('location', LOGIN_PATH);
	});
});

test.group('Account reactivation — confirming', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should clear the pending deletion and open a session', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reactivate-confirm' });
		await requestAccountDeletion(user);

		const response = await client
			.post(REACTIVATE_PATH)
			.withCsrfToken()
			.withSession(armedSession(user))
			.redirects(0);

		response.assertSession(SESSION_GUARD_KEY, user.id);

		const reloaded = await User.findOrFail(user.id);
		assert.isNull(reloaded.pendingDeletionAt);
	});

	test('should record a succeeded login event', async ({ assert, client }) => {
		const user = await createUser({
			emailPrefix: 'reactivate-confirm-journal',
		});
		await requestAccountDeletion(user);

		await client
			.post(REACTIVATE_PATH)
			.withCsrfToken()
			.withSession(armedSession(user))
			.redirects(0);

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.orderBy('id', 'desc')
			.firstOrFail();
		assert.equal(event.type, AUTH_EVENT_TYPE.LOGIN_SUCCEEDED);
	});

	test('should redirect to login when nothing is armed', async ({ client }) => {
		const response = await client
			.post(REACTIVATE_PATH)
			.withCsrfToken()
			.redirects(0);

		response.assertHeader('location', LOGIN_PATH);
	});
});

test.group('Account reactivation — declining', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should leave the account pending and open no session', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reactivate-decline' });
		await requestAccountDeletion(user);

		const response = await client
			.post(`${REACTIVATE_PATH}/decline`)
			.withCsrfToken()
			.withSession(armedSession(user))
			.redirects(0);

		response.assertHeader('location', LOGIN_PATH);
		response.assertSessionMissing(SESSION_GUARD_KEY);

		const reloaded = await User.findOrFail(user.id);
		assert.isNotNull(reloaded.pendingDeletionAt);
	});
});
