import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import { Secret } from '@adonisjs/core/helpers';
import type { ApiClient } from '@japa/api-client';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import AuditEvent from '#models/audit_event';
import UserSession from '#models/user_session';
import OneTimeToken from '#models/one_time_token';
import { freshSudoSession } from '#tests/helpers/sudo_mode';
import { PasswordHasher } from '#services/auth/password_hasher';
import { SessionService } from '#services/user/session_service';
import { newPasswordForm } from '#tests/helpers/password_forms';
import { MAILED_LINK_REQUEST_BURST_TIER } from '#start/limiter';
import { nextClientAddress } from '#tests/helpers/client_addresses';
import { AUTH_EVENT_TYPE, ONE_TIME_TOKEN_TYPE } from '#constants/auth';
import PasswordSetNotification from '#mails/password_set_notification';
import { createUserSession } from '#tests/factories/user_session_factory';
import ResetPasswordNotification from '#mails/reset_password_notification';
import { createUser, setUserPassword } from '#tests/factories/user_factory';
import { OneTimeTokenService } from '#services/auth/one_time_token_service';
import PasswordChangedNotification from '#mails/password_changed_notification';
import { enableOutgoingMail, queuedMails } from '#tests/helpers/outgoing_mail';
import { PASSWORD_RESET_REQUEST_MESSAGE } from '#controllers/auth/request_password_reset_controller';

const OLD_PASSWORD = 'correct-horse-battery-staple';
const NEW_PASSWORD = 'another-horse-battery-staple';
const UNKNOWN_EMAIL = 'nobody-at-all@example.com';
const PASSWORD_PATH = '/account/password';
const FORGOT_PASSWORD_PATH = '/forgot-password';
const SETTINGS_PATH = '/user/settings';
const LOGIN_PATH = '/login';
const INVALID_LINK_MESSAGE = 'This link is no longer valid';
const SESSION_GUARD_KEY = 'auth_web';

async function countResetTokens(): Promise<number> {
	const tokens = await OneTimeToken.query().where(
		'type',
		ONE_TIME_TOKEN_TYPE.PASSWORD_RESET
	);

	return tokens.length;
}

function submitPassword(client: ApiClient, user: User, password: string) {
	return client
		.post(PASSWORD_PATH)
		.form(newPasswordForm(password))
		.withCsrfToken()
		.loginAs(user)
		.withSession(freshSudoSession())
		.redirects(0);
}

function submitPasswordChange(client: ApiClient, user: User, password: string) {
	return client
		.put(PASSWORD_PATH)
		.form(newPasswordForm(password))
		.withCsrfToken()
		.loginAs(user)
		.withSession(freshSudoSession())
		.redirects(0);
}

function requestReset(client: ApiClient, email: string) {
	return client
		.post(FORGOT_PASSWORD_PATH)
		.header('x-forwarded-for', nextClientAddress())
		.form({ email })
		.withCsrfToken()
		.redirects(0);
}

function submitReset(
	client: ApiClient,
	secret: Secret<string>,
	password: string
) {
	return client
		.post(`/reset-password/${secret.release()}`)
		.header('x-forwarded-for', nextClientAddress())
		.form(newPasswordForm(password))
		.withCsrfToken()
		.redirects(0);
}

async function issueResetToken(user: User): Promise<Secret<string>> {
	const oneTimeTokenService = await app.container.make(OneTimeTokenService);
	const { secret } = await oneTimeTokenService.issue({
		userId: user.id,
		type: ONE_TIME_TOKEN_TYPE.PASSWORD_RESET,
	});

	return secret;
}

async function storedPasswordOf(user: User): Promise<string | null> {
	const owner = await User.query()
		.where('id', user.id)
		.preload('passwordAuth')
		.firstOrFail();

	return owner.passwordAuth?.password ?? null;
}

async function verifiesAgainst(
	user: User,
	plainPassword: string
): Promise<boolean> {
	const storedPassword = await storedPasswordOf(user);
	if (!storedPassword) return false;

	const passwordHasher = await app.container.make(PasswordHasher);

	return passwordHasher.verify(storedPassword, plainPassword);
}

test.group('Password — setting a first one', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(enableOutgoingMail);

	test('should give a password to an account that had none', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'password-set' });

		await submitPassword(client, user, NEW_PASSWORD);

		assert.isTrue(await verifiesAgainst(user, NEW_PASSWORD));
	});

	test('should store the password hashed', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'password-set-hashed' });

		await submitPassword(client, user, NEW_PASSWORD);

		assert.notEqual(await storedPasswordOf(user), NEW_PASSWORD);
	});

	test('should notify the account that a password was added', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'password-set-mail' });

		await submitPassword(client, user, NEW_PASSWORD);

		queuedMails().assertQueued(PasswordSetNotification);
	});

	test('should keep the extension tokens it did not replace', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'password-set-tokens' });
		await User.accessTokens.create(user, undefined, { name: 'Extension' });

		await submitPassword(client, user, NEW_PASSWORD);

		const remainingTokens = await User.accessTokens.all(user);
		assert.lengthOf(remainingTokens, 1);
	});

	test('should record a password set event', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'password-set-journal' });

		await submitPassword(client, user, NEW_PASSWORD);

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.firstOrFail();
		assert.equal(event.type, AUTH_EVENT_TYPE.PASSWORD_SET);
	});

	test('should refuse an account that already has a password', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'password-set-twice' });
		await setUserPassword(user, OLD_PASSWORD);

		const response = await submitPassword(client, user, NEW_PASSWORD);

		response.assertHeader('location', SETTINGS_PATH);
		response.assertFlashMessage(
			'error',
			'This account already has a password — change it instead of setting one'
		);
	});

	test('should leave the existing password untouched when it refuses', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'password-set-untouched' });
		await setUserPassword(user, OLD_PASSWORD);

		await submitPassword(client, user, NEW_PASSWORD);

		assert.isTrue(await verifiesAgainst(user, OLD_PASSWORD));
	});

	test('should refuse a password shorter than the policy', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'password-set-short' });

		await submitPassword(client, user, 'too-short');

		assert.isNull(await storedPasswordOf(user));
	});
});

test.group('Password — changing it', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(enableOutgoingMail);

	test('should replace the password', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'password-change' });
		await setUserPassword(user, OLD_PASSWORD);

		await submitPasswordChange(client, user, NEW_PASSWORD);

		assert.isTrue(await verifiesAgainst(user, NEW_PASSWORD));
	});

	test('should stop accepting the password it replaced', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'password-change-old' });
		await setUserPassword(user, OLD_PASSWORD);

		await submitPasswordChange(client, user, NEW_PASSWORD);

		assert.isFalse(await verifiesAgainst(user, OLD_PASSWORD));
	});

	test('should sign every other session out', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'password-change-sessions' });
		await setUserPassword(user, OLD_PASSWORD);
		await createUserSession(user);
		await createUserSession(user);

		await submitPasswordChange(client, user, NEW_PASSWORD);

		const remainingSessions = await UserSession.query().where(
			'userId',
			String(user.id)
		);
		assert.isEmpty(remainingSessions);
	});

	test('should revoke every extension token', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'password-change-tokens' });
		await setUserPassword(user, OLD_PASSWORD);
		await User.accessTokens.create(user, undefined, { name: 'Extension' });
		await User.accessTokens.create(user, undefined, { name: 'Script' });

		await submitPasswordChange(client, user, NEW_PASSWORD);

		const remainingTokens = await User.accessTokens.all(user);
		assert.isEmpty(remainingTokens);
	});

	test('should invalidate a reset link that was still in flight', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'password-change-token' });
		await setUserPassword(user, OLD_PASSWORD);
		await issueResetToken(user);

		await submitPasswordChange(client, user, NEW_PASSWORD);

		const outstandingTokens = await OneTimeToken.query()
			.where('userId', user.id)
			.whereNull('consumedAt');
		assert.isEmpty(outstandingTokens);
	});

	test('should notify the account that its password changed', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'password-change-mail' });
		await setUserPassword(user, OLD_PASSWORD);

		await submitPasswordChange(client, user, NEW_PASSWORD);

		queuedMails().assertQueued(PasswordChangedNotification);
	});

	test('should record a password changed event', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'password-change-journal' });
		await setUserPassword(user, OLD_PASSWORD);

		await submitPasswordChange(client, user, NEW_PASSWORD);

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.firstOrFail();
		assert.equal(event.type, AUTH_EVENT_TYPE.PASSWORD_CHANGED);
	});

	test('should refuse an account that has no password yet', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'password-change-none' });

		const response = await submitPasswordChange(client, user, NEW_PASSWORD);

		response.assertFlashMessage(
			'error',
			'This account has no password yet — set one instead of changing it'
		);
	});
});

test.group('Password — keeping the session that changed it', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should keep the session driving the change', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'session-revoke-keep' });
		const survivingSession = await createUserSession(user);
		await createUserSession(user);
		const sessionService = await app.container.make(SessionService);

		await sessionService.revokeAllExcept(user, survivingSession.id);

		const remainingSessions = await UserSession.query().where(
			'userId',
			String(user.id)
		);
		assert.deepEqual(
			remainingSessions.map((session) => session.id),
			[survivingSession.id]
		);
	});

	test('should keep none when no session is named', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'session-revoke-all' });
		await createUserSession(user);
		await createUserSession(user);
		const sessionService = await app.container.make(SessionService);

		await sessionService.revokeAllExcept(user, null);

		const remainingSessions = await UserSession.query().where(
			'userId',
			String(user.id)
		);
		assert.isEmpty(remainingSessions);
	});

	test('should leave another account sessions alone', async ({ assert }) => {
		const owner = await createUser({ emailPrefix: 'session-revoke-owner' });
		const bystander = await createUser({ emailPrefix: 'session-revoke-other' });
		await createUserSession(owner);
		await createUserSession(bystander);
		const sessionService = await app.container.make(SessionService);

		await sessionService.revokeAllExcept(owner, null);

		const bystanderSessions = await UserSession.query().where(
			'userId',
			String(bystander.id)
		);
		assert.lengthOf(bystanderSessions, 1);
	});
});

test.group('Password — asking for a reset link', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(enableOutgoingMail);

	test('should render the request form', async ({ client }) => {
		const response = await client.get(FORGOT_PASSWORD_PATH).withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('auth/forgot_password');
	});

	test('should mail a link to an address that has an account', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reset-request' });
		await setUserPassword(user, OLD_PASSWORD);

		await requestReset(client, user.email);

		queuedMails().assertQueued(ResetPasswordNotification);
	});

	test('should answer an unknown address exactly as a known one', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reset-known' });
		const knownResponse = await requestReset(client, user.email);

		const unknownResponse = await requestReset(client, UNKNOWN_EMAIL);

		unknownResponse.assertStatus(knownResponse.status());
		unknownResponse.assertHeader('location', LOGIN_PATH);
		knownResponse.assertHeader('location', LOGIN_PATH);
		unknownResponse.assertFlashMessage(
			'success',
			PASSWORD_RESET_REQUEST_MESSAGE
		);
		knownResponse.assertFlashMessage('success', PASSWORD_RESET_REQUEST_MESSAGE);
	});

	/**
	 * Counted rather than asserted empty: the table belongs to the whole
	 * instance, and a link an operator left behind while trying the feature by
	 * hand would otherwise make this test describe their database instead of
	 * the flow.
	 */
	test('should issue no token for an address nobody registered', async ({
		assert,
		client,
	}) => {
		const tokenCountBefore = await countResetTokens();

		await requestReset(client, UNKNOWN_EMAIL);

		assert.equal(await countResetTokens(), tokenCountBefore);
	});

	test('should invalidate the link it issued previously', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reset-reissued' });

		await requestReset(client, user.email);
		await requestReset(client, user.email);

		const outstandingTokens = await OneTimeToken.query()
			.where('userId', user.id)
			.whereNull('consumedAt');
		assert.lengthOf(outstandingTokens, 1);
	});

	test('should answer 429 once the burst quota is spent', async ({
		client,
	}) => {
		const clientAddress = nextClientAddress();
		const attempt = () =>
			client
				.post(FORGOT_PASSWORD_PATH)
				.header('x-forwarded-for', clientAddress)
				.form({ email: UNKNOWN_EMAIL })
				.withCsrfToken()
				.redirects(0);

		for (
			let index = 0;
			index < MAILED_LINK_REQUEST_BURST_TIER.requests;
			index += 1
		) {
			await attempt();
		}
		const response = await attempt();

		response.assertStatus(429);
	});
});

test.group('Password — reset without outgoing mail', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should not offer the request form at all', async ({ client }) => {
		const response = await client.get(FORGOT_PASSWORD_PATH);

		response.assertStatus(404);
	});

	test('should refuse a submitted request', async ({ client }) => {
		const response = await client
			.post(FORGOT_PASSWORD_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: UNKNOWN_EMAIL })
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(404);
	});
});

test.group('Password — redeeming a reset link', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(enableOutgoingMail);

	test('should render the form for whoever holds the link', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reset-form' });
		const secret = await issueResetToken(user);

		const response = await client
			.get(`/reset-password/${secret.release()}`)
			.header('x-forwarded-for', nextClientAddress())
			.withInertia();

		response.assertInertiaComponent('auth/reset_password');
	});

	test('should install the new password', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'reset-apply' });
		await setUserPassword(user, OLD_PASSWORD);
		const secret = await issueResetToken(user);

		await submitReset(client, secret, NEW_PASSWORD);

		assert.isTrue(await verifiesAgainst(user, NEW_PASSWORD));
	});

	test('should give a password to an account that had none', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reset-create' });
		const secret = await issueResetToken(user);

		await submitReset(client, secret, NEW_PASSWORD);

		assert.isTrue(await verifiesAgainst(user, NEW_PASSWORD));
	});

	test('should count the redeemed link as proof the address is real', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reset-verifies' });
		const secret = await issueResetToken(user);

		await submitReset(client, secret, NEW_PASSWORD);

		await user.refresh();
		assert.isNotNull(user.emailVerifiedAt);
	});

	test('should sign every session out', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'reset-sessions' });
		const secret = await issueResetToken(user);
		await createUserSession(user);

		await submitReset(client, secret, NEW_PASSWORD);

		const remainingSessions = await UserSession.query().where(
			'userId',
			String(user.id)
		);
		assert.isEmpty(remainingSessions);
	});

	test('should revoke every extension token', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'reset-tokens' });
		const secret = await issueResetToken(user);
		await User.accessTokens.create(user, undefined, { name: 'Extension' });

		await submitReset(client, secret, NEW_PASSWORD);

		const remainingTokens = await User.accessTokens.all(user);
		assert.isEmpty(remainingTokens);
	});

	test('should never sign the visitor in', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'reset-nologin' });
		const secret = await issueResetToken(user);

		const response = await submitReset(client, secret, NEW_PASSWORD);

		response.assertSessionMissing(SESSION_GUARD_KEY);
		response.assertHeader('location', LOGIN_PATH);
	});

	test('should record a completed reset event', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'reset-journal' });
		const secret = await issueResetToken(user);

		await submitReset(client, secret, NEW_PASSWORD);

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.andWhere('type', AUTH_EVENT_TYPE.PASSWORD_RESET_COMPLETED)
			.first();
		assert.isNotNull(event);
	});

	test('should refuse a link that was already used', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'reset-replay' });
		const secret = await issueResetToken(user);
		await submitReset(client, secret, NEW_PASSWORD);

		const response = await submitReset(client, secret, NEW_PASSWORD);

		response.assertFlashMessage('error', INVALID_LINK_MESSAGE);
	});

	test('should refuse a link that expired', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'reset-expired' });
		const secret = await issueResetToken(user);
		await OneTimeToken.query()
			.where('userId', user.id)
			.update({ expires_at: DateTime.now().minus({ hours: 1 }).toSQL() });

		const response = await submitReset(client, secret, NEW_PASSWORD);

		response.assertFlashMessage('error', INVALID_LINK_MESSAGE);
	});

	test('should leave the password alone when the link is refused', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'reset-refused' });
		await setUserPassword(user, OLD_PASSWORD);
		const secret = await issueResetToken(user);
		await OneTimeToken.query()
			.where('userId', user.id)
			.update({ expires_at: DateTime.now().minus({ hours: 1 }).toSQL() });

		await submitReset(client, secret, NEW_PASSWORD);

		assert.isTrue(await verifiesAgainst(user, OLD_PASSWORD));
	});
});
