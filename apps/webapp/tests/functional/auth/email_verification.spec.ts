import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import { Secret } from '@adonisjs/core/helpers';
import type { ApiClient } from '@japa/api-client';
import testUtils from '@adonisjs/core/services/test_utils';

import type User from '#models/user';
import AuditEvent from '#models/audit_event';
import OneTimeToken from '#models/one_time_token';
import { createUser } from '#tests/factories/user_factory';
import { TOKEN_VERIFICATION_BURST_TIER } from '#start/limiter';
import { nextClientAddress } from '#tests/helpers/client_addresses';
import VerifyEmailNotification from '#mails/verify_email_notification';
import { AUTH_EVENT_TYPE, ONE_TIME_TOKEN_TYPE } from '#constants/auth';
import { OneTimeTokenService } from '#services/auth/one_time_token_service';
import { enableOutgoingMail, queuedMails } from '#tests/helpers/outgoing_mail';
import { EmailVerificationService } from '#services/auth/email_verification_service';

const UNKNOWN_TOKEN = 'this-token-was-never-issued';
const INVALID_LINK_MESSAGE = 'This link is no longer valid';
const HOME_PATH = '/';

async function issueVerificationToken(user: User): Promise<Secret<string>> {
	const oneTimeTokenService = await app.container.make(OneTimeTokenService);
	const { secret } = await oneTimeTokenService.issue({
		userId: user.id,
		type: ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION,
	});

	return secret;
}

function followVerificationLink(client: ApiClient, secret: Secret<string>) {
	return client
		.get(`/verify-email/${secret.release()}`)
		.header('x-forwarded-for', nextClientAddress())
		.redirects(0);
}

async function expireTokensOf(user: User): Promise<void> {
	await OneTimeToken.query()
		.where('userId', user.id)
		.update({ expires_at: DateTime.now().minus({ hours: 1 }).toSQL() });
}

test.group('One-time tokens', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should resolve a freshly issued token to its own record', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'token-fresh' });
		const secret = await issueVerificationToken(user);
		const oneTimeTokenService = await app.container.make(OneTimeTokenService);

		const consumedUserId = await oneTimeTokenService.consume(
			{ secret, type: ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION },
			async (token) => token.userId
		);

		assert.equal(consumedUserId, user.id);
	});

	test('should hand back a token that redacts itself when printed', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'token-redacted' });
		const oneTimeTokenService = await app.container.make(OneTimeTokenService);

		const { secret } = await oneTimeTokenService.issue({
			userId: user.id,
			type: ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION,
		});

		// What a stray `logger.info({ token })` would end up writing. The clear
		// value stays reachable, but only by asking for it.
		assert.equal(JSON.stringify({ token: secret }), '{"token":"[redacted]"}');
		assert.notEqual(secret.release(), '[redacted]');
	});

	test('should refuse a token nobody ever issued', async ({ assert }) => {
		const oneTimeTokenService = await app.container.make(OneTimeTokenService);

		await assert.rejects(
			() =>
				oneTimeTokenService.consume(
					{
						secret: new Secret(UNKNOWN_TOKEN),
						type: ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION,
					},
					async (token) => token.id
				),
			INVALID_LINK_MESSAGE
		);
	});

	test('should refuse a token issued for another purpose', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'token-purpose' });
		const secret = await issueVerificationToken(user);
		const oneTimeTokenService = await app.container.make(OneTimeTokenService);

		await assert.rejects(() =>
			oneTimeTokenService.consume(
				{ secret, type: ONE_TIME_TOKEN_TYPE.PASSWORD_RESET },
				async (token) => token.id
			)
		);
	});

	test('should refuse a token that expired', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'token-expired' });
		const secret = await issueVerificationToken(user);
		await expireTokensOf(user);
		const oneTimeTokenService = await app.container.make(OneTimeTokenService);

		await assert.rejects(() =>
			oneTimeTokenService.consume(
				{ secret, type: ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION },
				async (token) => token.id
			)
		);
	});

	test('should refuse a token that was already consumed', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'token-replay' });
		const secret = await issueVerificationToken(user);
		const oneTimeTokenService = await app.container.make(OneTimeTokenService);
		const consume = () =>
			oneTimeTokenService.consume(
				{ secret, type: ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION },
				async (token) => token.id
			);
		await consume();

		await assert.rejects(consume);
	});

	test('should refuse every outstanding token of a type after a mass invalidation', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'token-invalidated' });
		const secret = await issueVerificationToken(user);
		const oneTimeTokenService = await app.container.make(OneTimeTokenService);

		await oneTimeTokenService.invalidateAll({
			userId: user.id,
			type: ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION,
		});

		await assert.rejects(() =>
			oneTimeTokenService.consume(
				{ secret, type: ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION },
				async (token) => token.id
			)
		);
	});

	test('should leave the token usable when the action it guards fails', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'token-atomic' });
		const secret = await issueVerificationToken(user);
		const oneTimeTokenService = await app.container.make(OneTimeTokenService);
		await assert.rejects(() =>
			oneTimeTokenService.consume(
				{ secret, type: ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION },
				async () => {
					throw new Error('the guarded action failed');
				}
			)
		);

		const consumedUserId = await oneTimeTokenService.consume(
			{ secret, type: ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION },
			async (token) => token.userId
		);

		assert.equal(consumedUserId, user.id);
	});
});

test.group('Email verification — issuing the link', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(enableOutgoingMail);

	test('should queue a verification email for the account', async () => {
		const user = await createUser({ emailPrefix: 'verification-enabled' });
		const emailVerificationService = await app.container.make(
			EmailVerificationService
		);

		await emailVerificationService.sendVerificationLink(user);

		queuedMails().assertQueued(VerifyEmailNotification);
	});

	test('should invalidate the link it issued previously', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'verification-reissued' });
		const emailVerificationService = await app.container.make(
			EmailVerificationService
		);

		await emailVerificationService.sendVerificationLink(user);
		await emailVerificationService.sendVerificationLink(user);

		const outstandingTokens = await OneTimeToken.query()
			.where('userId', user.id)
			.whereNull('consumedAt');
		assert.lengthOf(outstandingTokens, 1);
	});
});

test.group('Email verification — without outgoing mail', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should issue no token, since no link can reach the account', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'verification-disabled' });
		const emailVerificationService = await app.container.make(
			EmailVerificationService
		);

		await emailVerificationService.sendVerificationLink(user);

		const tokens = await OneTimeToken.query().where('userId', user.id);
		assert.lengthOf(tokens, 0);
	});
});

test.group('Email verification — confirming the address', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should mark the address verified when the link is fresh', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'verify-fresh' });
		const secret = await issueVerificationToken(user);

		await followVerificationLink(client, secret);

		await user.refresh();
		assert.isNotNull(user.emailVerifiedAt);
	});

	test('should record an email verified event', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'verify-journal' });
		const secret = await issueVerificationToken(user);

		await followVerificationLink(client, secret);

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.firstOrFail();
		assert.equal(event.type, AUTH_EVENT_TYPE.EMAIL_VERIFIED);
	});

	test('should refuse a link that was already used', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'verify-replay' });
		const secret = await issueVerificationToken(user);
		await followVerificationLink(client, secret);

		const response = await followVerificationLink(client, secret);

		response.assertHeader('location', HOME_PATH);
		response.assertFlashMessage('error', INVALID_LINK_MESSAGE);
	});

	test('should refuse a link that expired', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'verify-expired' });
		const secret = await issueVerificationToken(user);
		await expireTokensOf(user);

		const response = await followVerificationLink(client, secret);

		response.assertFlashMessage('error', INVALID_LINK_MESSAGE);
	});

	test('should leave the address unverified when the link is refused', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'verify-refused' });
		const secret = await issueVerificationToken(user);
		await expireTokensOf(user);

		await followVerificationLink(client, secret);

		await user.refresh();
		assert.isNull(user.emailVerifiedAt);
	});
});

test.group('Email verification — throttling', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 429 once the burst quota is spent', async ({
		client,
	}) => {
		const clientAddress = nextClientAddress();
		const attempt = () =>
			client
				.get(`/verify-email/${UNKNOWN_TOKEN}`)
				.header('x-forwarded-for', clientAddress)
				.redirects(0);

		for (
			let index = 0;
			index < TOKEN_VERIFICATION_BURST_TIER.requests;
			index += 1
		) {
			await attempt();
		}
		const response = await attempt();

		response.assertStatus(429);
	});
});
