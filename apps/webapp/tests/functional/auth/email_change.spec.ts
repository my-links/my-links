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
import { createUser } from '#tests/factories/user_factory';
import { freshSudoSession } from '#tests/helpers/sudo_mode';
import { EMAIL_CHANGE_REQUEST_BURST_TIER } from '#start/limiter';
import { nextClientAddress } from '#tests/helpers/client_addresses';
import { AUTH_EVENT_TYPE, ONE_TIME_TOKEN_TYPE } from '#constants/auth';
import EmailChangeConfirmation from '#mails/email_change_confirmation';
import { createUserSession } from '#tests/factories/user_session_factory';
import { OneTimeTokenService } from '#services/auth/one_time_token_service';
import { enableOutgoingMail, queuedMails } from '#tests/helpers/outgoing_mail';
import EmailChangeRequestedNotification from '#mails/email_change_requested_notification';
import { EMAIL_CHANGE_REQUEST_MESSAGE } from '#controllers/auth/request_email_change_controller';

const NEW_EMAIL = 'moved-to@example.com';
const EMAIL_PATH = '/account/email';
const SETTINGS_PATH = '/user/settings';
const LOGIN_PATH = '/login';
const SUDO_PATH = '/sudo';
const INVALID_LINK_MESSAGE = 'This link is no longer valid';

function requestChange(client: ApiClient, user: User, newEmail: string) {
	return client
		.post(EMAIL_PATH)
		.header('x-forwarded-for', nextClientAddress())
		.form({ email: newEmail })
		.withCsrfToken()
		.loginAs(user)
		.withSession(freshSudoSession())
		.redirects(0);
}

function followConfirmationLink(client: ApiClient, secret: Secret<string>) {
	return client
		.get(`/confirm-email-change/${secret.release()}`)
		.header('x-forwarded-for', nextClientAddress())
		.redirects(0);
}

function followCancellationLink(client: ApiClient, secret: Secret<string>) {
	return client
		.get(`/cancel-email-change/${secret.release()}`)
		.header('x-forwarded-for', nextClientAddress())
		.redirects(0);
}

async function issueChangeToken(
	user: User,
	newEmail: string
): Promise<Secret<string>> {
	const oneTimeTokenService = await app.container.make(OneTimeTokenService);
	const { secret } = await oneTimeTokenService.issue({
		userId: user.id,
		type: ONE_TIME_TOKEN_TYPE.EMAIL_CHANGE,
		newEmail,
	});

	return secret;
}

async function issueCancellationToken(user: User): Promise<Secret<string>> {
	const oneTimeTokenService = await app.container.make(OneTimeTokenService);
	const { secret } = await oneTimeTokenService.issue({
		userId: user.id,
		type: ONE_TIME_TOKEN_TYPE.EMAIL_CHANGE_CANCELLATION,
	});

	return secret;
}

function outstandingTokensOf(user: User, type: string) {
	return OneTimeToken.query()
		.where('userId', user.id)
		.andWhere('type', type)
		.whereNull('consumedAt');
}

function expireTokensOf(user: User) {
	return OneTimeToken.query()
		.where('userId', user.id)
		.update({ expires_at: DateTime.now().minus({ hours: 1 }).toSQL() });
}

test.group('Email change — asking for one', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(enableOutgoingMail);

	test('should mail a confirmation link to the new address', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-change-confirm-mail' });

		await requestChange(client, user, NEW_EMAIL);

		queuedMails().assertQueued(EmailChangeConfirmation, (mail) =>
			mail.message.hasTo(NEW_EMAIL)
		);
	});

	test('should mail a cancellation link to the current address', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-change-notice-mail' });

		await requestChange(client, user, NEW_EMAIL);

		queuedMails().assertQueued(EmailChangeRequestedNotification, (mail) =>
			mail.message.hasTo(user.email)
		);
	});

	test('should leave the address alone until it is confirmed', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-change-pending' });
		const currentEmail = user.email;

		await requestChange(client, user, NEW_EMAIL);

		await user.refresh();
		assert.equal(user.email, currentEmail);
	});

	test('should bind the issued token to the new address', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-change-bound' });

		await requestChange(client, user, NEW_EMAIL);

		const token = await outstandingTokensOf(
			user,
			ONE_TIME_TOKEN_TYPE.EMAIL_CHANGE
		).firstOrFail();
		assert.equal(token.newEmail, NEW_EMAIL);
	});

	test('should refuse the address the account already uses', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-change-same' });

		const response = await requestChange(client, user, user.email);

		response.assertFlashMessage(
			'error',
			'This is already the address on this account'
		);
	});

	test('should answer a taken address exactly as an available one', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-change-taken' });
		const bystander = await createUser({ emailPrefix: 'email-change-owner' });

		const takenResponse = await requestChange(client, user, bystander.email);
		const availableResponse = await requestChange(client, user, NEW_EMAIL);

		takenResponse.assertStatus(availableResponse.status());
		takenResponse.assertHeader('location', SETTINGS_PATH);
		takenResponse.assertFlashMessage('success', EMAIL_CHANGE_REQUEST_MESSAGE);
		availableResponse.assertFlashMessage(
			'success',
			EMAIL_CHANGE_REQUEST_MESSAGE
		);
	});

	test('should issue no token for an address somebody else holds', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-change-taken-token' });
		const bystander = await createUser({
			emailPrefix: 'email-change-taken-holder',
		});

		await requestChange(client, user, bystander.email);

		const outstandingTokens = await outstandingTokensOf(
			user,
			ONE_TIME_TOKEN_TYPE.EMAIL_CHANGE
		);
		assert.isEmpty(outstandingTokens);
	});

	test('should retire the request it issued previously', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-change-reissued' });

		await requestChange(client, user, NEW_EMAIL);
		await requestChange(client, user, 'moved-elsewhere@example.com');

		const outstandingChangeTokens = await outstandingTokensOf(
			user,
			ONE_TIME_TOKEN_TYPE.EMAIL_CHANGE
		);
		const outstandingCancellationTokens = await outstandingTokensOf(
			user,
			ONE_TIME_TOKEN_TYPE.EMAIL_CHANGE_CANCELLATION
		);
		assert.lengthOf(outstandingChangeTokens, 1);
		assert.lengthOf(outstandingCancellationTokens, 1);
	});

	test('should record an email change requested event', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-change-journal' });

		await requestChange(client, user, NEW_EMAIL);

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.andWhere('type', AUTH_EVENT_TYPE.EMAIL_CHANGE_REQUESTED)
			.first();
		assert.isNotNull(event);
	});

	test('should demand a recent proof of identity', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'email-change-sudo' });

		const response = await client
			.post(EMAIL_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: NEW_EMAIL })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertHeader('location', SUDO_PATH);
	});

	test('should flash a message and redirect back once the burst quota is spent', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-change-throttle' });
		const clientAddress = nextClientAddress();
		const attempt = () =>
			client
				.post(EMAIL_PATH)
				.header('x-forwarded-for', clientAddress)
				.form({ email: NEW_EMAIL })
				.withCsrfToken()
				.loginAs(user)
				.withSession(freshSudoSession())
				.redirects(0);

		for (
			let index = 0;
			index < EMAIL_CHANGE_REQUEST_BURST_TIER.requests;
			index += 1
		) {
			await attempt();
		}
		const response = await attempt();

		response.assertFlashMessage('error', 'Too many requests');
	});
});

test.group('Email change — without outgoing mail', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should refuse the request outright', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'email-change-nomail' });

		const response = await requestChange(client, user, NEW_EMAIL);

		response.assertStatus(404);
	});

	test('should issue no token', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'email-change-nomail-token' });

		await requestChange(client, user, NEW_EMAIL);

		const outstandingTokens = await outstandingTokensOf(
			user,
			ONE_TIME_TOKEN_TYPE.EMAIL_CHANGE
		);
		assert.isEmpty(outstandingTokens);
	});
});

test.group('Email change — confirming it', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should move the account to the new address', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-confirm-apply' });
		const secret = await issueChangeToken(user, NEW_EMAIL);

		await followConfirmationLink(client, secret);

		await user.refresh();
		assert.equal(user.email, NEW_EMAIL);
	});

	test('should count the confirmation as proof the address is real', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-confirm-verified' });
		const secret = await issueChangeToken(user, NEW_EMAIL);

		await followConfirmationLink(client, secret);

		await user.refresh();
		assert.isNotNull(user.emailVerifiedAt);
	});

	test('should retire the cancellation link it supersedes', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-confirm-cancel' });
		const secret = await issueChangeToken(user, NEW_EMAIL);
		await issueCancellationToken(user);

		await followConfirmationLink(client, secret);

		const outstandingTokens = await outstandingTokensOf(
			user,
			ONE_TIME_TOKEN_TYPE.EMAIL_CHANGE_CANCELLATION
		);
		assert.isEmpty(outstandingTokens);
	});

	test('should record an email changed event', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'email-confirm-journal' });
		const secret = await issueChangeToken(user, NEW_EMAIL);

		await followConfirmationLink(client, secret);

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.andWhere('type', AUTH_EVENT_TYPE.EMAIL_CHANGED)
			.first();
		assert.isNotNull(event);
	});

	test('should never sign the visitor in', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'email-confirm-nologin' });
		const secret = await issueChangeToken(user, NEW_EMAIL);

		const response = await followConfirmationLink(client, secret);

		response.assertSessionMissing('auth_web');
		response.assertHeader('location', LOGIN_PATH);
	});

	test('should refuse a link that was already used', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'email-confirm-replay' });
		const secret = await issueChangeToken(user, NEW_EMAIL);
		await followConfirmationLink(client, secret);

		const response = await followConfirmationLink(client, secret);

		response.assertFlashMessage('error', INVALID_LINK_MESSAGE);
	});

	test('should refuse a link that expired', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'email-confirm-expired' });
		const secret = await issueChangeToken(user, NEW_EMAIL);
		await expireTokensOf(user);

		const response = await followConfirmationLink(client, secret);

		response.assertFlashMessage('error', INVALID_LINK_MESSAGE);
	});

	test('should leave the address alone when the link is refused', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-confirm-refused' });
		const currentEmail = user.email;
		const secret = await issueChangeToken(user, NEW_EMAIL);
		await expireTokensOf(user);

		await followConfirmationLink(client, secret);

		await user.refresh();
		assert.equal(user.email, currentEmail);
	});

	test('should refuse an address somebody registered in the meantime', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-confirm-race' });
		const currentEmail = user.email;
		const secret = await issueChangeToken(user, NEW_EMAIL);
		await User.create({ email: NEW_EMAIL, name: 'First Claimer' });

		await followConfirmationLink(client, secret);

		await user.refresh();
		assert.equal(user.email, currentEmail);
	});

	test('should leave the link usable when it refuses the address', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-confirm-race-token' });
		const secret = await issueChangeToken(user, NEW_EMAIL);
		const claimer = await User.create({
			email: NEW_EMAIL,
			name: 'First Claimer',
		});
		await followConfirmationLink(client, secret);
		await claimer.delete();

		await followConfirmationLink(client, secret);

		await user.refresh();
		assert.equal(user.email, NEW_EMAIL);
	});
});

test.group('Email change — cancelling it', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should keep the address the account has', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-cancel-keep' });
		const currentEmail = user.email;
		await issueChangeToken(user, NEW_EMAIL);
		const secret = await issueCancellationToken(user);

		await followCancellationLink(client, secret);

		await user.refresh();
		assert.equal(user.email, currentEmail);
	});

	test('should retire the pending confirmation link', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'email-cancel-token' });
		const changeSecret = await issueChangeToken(user, NEW_EMAIL);
		const secret = await issueCancellationToken(user);

		await followCancellationLink(client, secret);
		await followConfirmationLink(client, changeSecret);

		await user.refresh();
		assert.notEqual(user.email, NEW_EMAIL);
	});

	test('should sign every session out', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'email-cancel-sessions' });
		const secret = await issueCancellationToken(user);
		await createUserSession(user);

		await followCancellationLink(client, secret);

		const remainingSessions = await UserSession.query().where(
			'userId',
			String(user.id)
		);
		assert.isEmpty(remainingSessions);
	});

	test('should revoke every extension token', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'email-cancel-tokens' });
		const secret = await issueCancellationToken(user);
		await User.accessTokens.create(user, undefined, { name: 'Extension' });

		await followCancellationLink(client, secret);

		const remainingTokens = await User.accessTokens.all(user);
		assert.isEmpty(remainingTokens);
	});

	test('should record a cancelled event', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'email-cancel-journal' });
		const secret = await issueCancellationToken(user);

		await followCancellationLink(client, secret);

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.andWhere('type', AUTH_EVENT_TYPE.EMAIL_CHANGE_CANCELLED)
			.first();
		assert.isNotNull(event);
	});

	test('should refuse a link that was already used', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'email-cancel-replay' });
		const secret = await issueCancellationToken(user);
		await followCancellationLink(client, secret);

		const response = await followCancellationLink(client, secret);

		response.assertFlashMessage('error', INVALID_LINK_MESSAGE);
	});
});
