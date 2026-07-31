import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import AuthEvent from '#models/auth_event';
import OneTimeToken from '#models/one_time_token';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { VERIFICATION_RESEND_BURST_TIER } from '#start/limiter';
import { nextClientAddress } from '#tests/helpers/client_addresses';
import VerifyEmailNotification from '#mails/verify_email_notification';
import { enableOutgoingMail, queuedMails } from '#tests/helpers/outgoing_mail';
import { UNVERIFIED_EMAIL_MESSAGE } from '#exceptions/auth/unverified_email_exception';
import { VERIFICATION_RESEND_MESSAGE } from '#controllers/auth/resend_verification_controller';
import {
	createUser,
	setUserPassword,
	verifyUserEmail,
} from '#tests/factories/user_factory';

const VALID_PASSWORD = 'correct-horse-battery-staple';
const WRONG_PASSWORD = 'wrong-horse-battery-staple';
const UNKNOWN_EMAIL = 'nobody@example.com';
const GENERIC_FAILURE_MESSAGE = 'Invalid email address or password';
const SESSION_GUARD_KEY = 'auth_web';
const LOGIN_PATH = '/login';
const RESEND_PATH = '/resend-verification';

async function countOneTimeTokens(): Promise<number> {
	const tokens = await OneTimeToken.query();

	return tokens.length;
}

test.group('Email verification gate — with outgoing mail', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());
	group.each.setup(enableOutgoingMail);

	test('should refuse a valid password while the address is unconfirmed', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'gate-unverified' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post(LOGIN_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		response.assertSessionMissing(SESSION_GUARD_KEY);
	});

	test('should name the reason it refused, since the password proved ownership', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'gate-reason' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post(LOGIN_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		response.assertFlashMessage('error', UNVERIFIED_EMAIL_MESSAGE);
	});

	test('should record a blocked sign-in event against the account', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'gate-journal' });
		await setUserPassword(user, VALID_PASSWORD);

		await client
			.post(LOGIN_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		const event = await AuthEvent.query()
			.where('userId', user.id)
			.orderBy('id', 'desc')
			.firstOrFail();
		assert.equal(event.type, AUTH_EVENT_TYPE.LOGIN_BLOCKED_UNVERIFIED);
	});

	test('should sign in an account whose address is confirmed', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'gate-verified' });
		await setUserPassword(user, VALID_PASSWORD);
		await verifyUserEmail(user);

		const response = await client
			.post(LOGIN_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		response.assertSession(SESSION_GUARD_KEY, user.id);
	});

	test('should answer a wrong password on an unconfirmed account with the credentials refusal', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'gate-wrong-password' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post(LOGIN_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: WRONG_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		// The refusal that names the address as unconfirmed is only earned by
		// presenting the right password: served any earlier it would tell a
		// stranger which addresses have an account.
		response.assertFlashMessage('error', GENERIC_FAILURE_MESSAGE);
	});

	test('should offer the resend action on the login page it sends the visitor back to', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'gate-resend-action' });

		const response = await client
			.get(LOGIN_PATH)
			.withFlashMessages({ unconfirmedEmail: user.email })
			.withInertia();

		response.assertInertiaPropsContains({ unconfirmedEmail: user.email });
	});
});

test.group('Email verification gate — without outgoing mail', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should sign in an unconfirmed account, since no link can ever reach it', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'gate-no-mail' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post(LOGIN_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		response.assertSession(SESSION_GUARD_KEY, user.id);
	});

	test('should answer 404 on the resend route, since the feature is absent', async ({
		client,
	}) => {
		const response = await client
			.post(RESEND_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: UNKNOWN_EMAIL })
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(404);
	});
});

test.group('Verification link — resending', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());
	group.each.setup(enableOutgoingMail);

	test('should mail a fresh link to an unconfirmed account', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'resend-unverified' });

		await client
			.post(RESEND_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email })
			.withCsrfToken()
			.redirects(0);

		queuedMails().assertQueued(VerifyEmailNotification);
	});

	test('should answer an unknown address exactly like a known one', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'resend-known' });
		const knownAddressResponse = await client
			.post(RESEND_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email })
			.withCsrfToken()
			.redirects(0);

		const unknownAddressResponse = await client
			.post(RESEND_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: UNKNOWN_EMAIL })
			.withCsrfToken()
			.redirects(0);

		unknownAddressResponse.assertStatus(knownAddressResponse.status());
		unknownAddressResponse.assertFlashMessage(
			'success',
			VERIFICATION_RESEND_MESSAGE
		);
	});

	/**
	 * Counted rather than asserted empty: the table belongs to the whole
	 * instance, and a row an operator left behind while trying the feature by
	 * hand would otherwise make this test describe their database instead of
	 * the flow.
	 */
	test('should issue no token for an address nobody registered', async ({
		assert,
		client,
	}) => {
		const tokenCountBefore = await countOneTimeTokens();

		await client
			.post(RESEND_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: UNKNOWN_EMAIL })
			.withCsrfToken()
			.redirects(0);

		assert.equal(await countOneTimeTokens(), tokenCountBefore);
	});

	test('should issue no token for an account that is already confirmed', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'resend-verified' });
		await verifyUserEmail(user);

		const response = await client
			.post(RESEND_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email })
			.withCsrfToken()
			.redirects(0);

		const tokens = await OneTimeToken.query().where('userId', user.id);
		assert.lengthOf(tokens, 0);
		response.assertFlashMessage('success', VERIFICATION_RESEND_MESSAGE);
	});
});

test.group('Verification link — resend throttling', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());
	group.each.setup(enableOutgoingMail);

	test('should answer 429 once the burst quota is spent', async ({
		client,
	}) => {
		const clientAddress = nextClientAddress();
		const attempt = () =>
			client
				.post(RESEND_PATH)
				.header('x-forwarded-for', clientAddress)
				.form({ email: UNKNOWN_EMAIL })
				.withCsrfToken()
				.redirects(0);

		for (
			let index = 0;
			index < VERIFICATION_RESEND_BURST_TIER.requests;
			index += 1
		) {
			await attempt();
		}
		const response = await attempt();

		response.assertStatus(429);
	});
});
