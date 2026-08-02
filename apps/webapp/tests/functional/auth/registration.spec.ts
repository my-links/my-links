import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import type { ApiClient } from '@japa/api-client';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import AuditEvent from '#models/audit_event';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { REGISTRATION_BURST_TIER } from '#start/limiter';
import { UserService } from '#services/user/user_service';
import { createUser } from '#tests/factories/user_factory';
import { nextClientAddress } from '#tests/helpers/client_addresses';
import VerifyEmailNotification from '#mails/verify_email_notification';
import { enableOutgoingMail, queuedMails } from '#tests/helpers/outgoing_mail';
import { RegistrationPolicyService } from '#services/auth/registration_policy_service';
import { REGISTRATION_CONFIRMATION_MESSAGES } from '#controllers/auth/register_controller';

const NEW_ACCOUNT_NAME = 'Ada Lovelace';
const VALID_PASSWORD = 'correct-horse-battery-staple';
const LOGIN_PATH = '/login';
const HOME_PATH = '/';

let registrationCounter = 0;

function nextEmail(): string {
	registrationCounter += 1;

	return `register-${Date.now()}-${registrationCounter}@example.com`;
}

function registrationForm(email: string) {
	return {
		name: NEW_ACCOUNT_NAME,
		email,
		password: VALID_PASSWORD,
		passwordConfirmation: VALID_PASSWORD,
	};
}

/**
 * Registration closes on its own once an instance has an account, so a test
 * about a brand new instance has to start from an empty one. The delete is
 * safe because every group here runs inside a rolled back transaction.
 */
async function emptyInstance(): Promise<void> {
	await User.query().delete();
}

/**
 * Past the bootstrap window, the default policy answers "closed" — which is the
 * very thing most of these tests are not about. Overriding the decision keeps
 * them focused on what happens once a visitor is allowed through.
 */
class AlwaysOpenRegistrationPolicyService extends RegistrationPolicyService {
	override async isOpen(): Promise<boolean> {
		return true;
	}
}

function openRegistration() {
	app.container.swap(
		RegistrationPolicyService,
		async () =>
			new AlwaysOpenRegistrationPolicyService(
				await app.container.make(UserService)
			)
	);

	return () => app.container.restore(RegistrationPolicyService);
}

function submitRegistration(client: ApiClient, email: string) {
	return client
		.post('/register')
		.header('x-forwarded-for', nextClientAddress())
		.form(registrationForm(email))
		.withCsrfToken()
		.redirects(0);
}

test.group('Registration — a brand new instance', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(() => emptyInstance());
	group.each.setup(enableOutgoingMail);

	test('should render the register page to a guest', async ({ client }) => {
		const response = await client.get('/register').withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('auth/register');
	});

	test('should create the account when the email address is available', async ({
		assert,
		client,
	}) => {
		const email = nextEmail();

		await submitRegistration(client, email);

		const registeredUser = await User.findBy('email', email);
		assert.isNotNull(registeredUser);
	});

	test('should attach a password to the new account', async ({
		assert,
		client,
	}) => {
		const email = nextEmail();

		await submitRegistration(client, email);

		const registeredUser = await User.query()
			.where('email', email)
			.preload('passwordAuth')
			.firstOrFail();
		assert.isNotNull(registeredUser.passwordAuth);
	});

	test('should leave the new account unverified', async ({
		assert,
		client,
	}) => {
		const email = nextEmail();

		await submitRegistration(client, email);

		const registeredUser = await User.findByOrFail('email', email);
		assert.isNull(registeredUser.emailVerifiedAt);
	});

	test('should never sign the visitor in on registration', async ({
		client,
	}) => {
		const response = await submitRegistration(client, nextEmail());

		response.assertSessionMissing('auth_web');
	});

	test('should send the visitor to the login page with the confirmation notice', async ({
		client,
	}) => {
		const response = await submitRegistration(client, nextEmail());

		response.assertHeader('location', LOGIN_PATH);
		response.assertFlashMessage(
			'success',
			REGISTRATION_CONFIRMATION_MESSAGES.WITH_MAIL
		);
	});

	test('should queue a verification email for the new account', async ({
		client,
	}) => {
		await submitRegistration(client, nextEmail());

		queuedMails().assertQueued(VerifyEmailNotification);
	});

	test('should record a registered event for the new account', async ({
		assert,
		client,
	}) => {
		const email = nextEmail();

		await submitRegistration(client, email);

		const registeredUser = await User.findByOrFail('email', email);
		const event = await AuditEvent.query()
			.where('userId', registeredUser.id)
			.firstOrFail();
		assert.equal(event.type, AUTH_EVENT_TYPE.REGISTERED);
	});

	test('should make the very first account an administrator', async ({
		assert,
		client,
	}) => {
		const email = nextEmail();

		await submitRegistration(client, email);

		const registeredUser = await User.findByOrFail('email', email);
		assert.isTrue(registeredUser.isAdmin);
	});
});

test.group('Registration — an instance without outgoing mail', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(() => emptyInstance());

	test('should confirm without promising an email nobody can send', async ({
		client,
	}) => {
		const response = await submitRegistration(client, nextEmail());

		response.assertFlashMessage(
			'success',
			REGISTRATION_CONFIRMATION_MESSAGES.WITHOUT_MAIL
		);
	});
});

test.group(
	'Registration — an instance that already has an account',
	(group) => {
		group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

		test('should stop rendering the register page once an account exists', async ({
			client,
		}) => {
			await createUser({ emailPrefix: 'registration-closed' });

			const response = await client.get('/register').redirects(0);

			response.assertHeader('location', HOME_PATH);
		});

		test('should refuse a submission once an account exists', async ({
			assert,
			client,
		}) => {
			await createUser({ emailPrefix: 'registration-closed' });
			const email = nextEmail();

			await submitRegistration(client, email);

			assert.isNull(await User.findBy('email', email));
		});
	}
);

test.group('Registration — an email address already registered', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(openRegistration);
	group.each.setup(enableOutgoingMail);

	test('should not create a second account for that address', async ({
		assert,
		client,
	}) => {
		const existingUser = await createUser({
			emailPrefix: 'registration-taken',
		});

		await submitRegistration(client, existingUser.email);

		const accounts = await User.query().where('email', existingUser.email);
		assert.lengthOf(accounts, 1);
	});

	test('should leave the existing account untouched', async ({
		assert,
		client,
	}) => {
		const existingUser = await createUser({
			emailPrefix: 'registration-taken',
		});

		await submitRegistration(client, existingUser.email);

		const existingAccount = await User.query()
			.where('id', existingUser.id)
			.preload('passwordAuth')
			.firstOrFail();
		assert.isNull(existingAccount.passwordAuth);
	});

	test('should answer exactly as it answers an available address', async ({
		client,
	}) => {
		const existingUser = await createUser({
			emailPrefix: 'registration-taken',
		});

		const response = await submitRegistration(client, existingUser.email);

		response.assertHeader('location', LOGIN_PATH);
		response.assertFlashMessage(
			'success',
			REGISTRATION_CONFIRMATION_MESSAGES.WITH_MAIL
		);
	});

	test('should queue no email at all', async ({ client }) => {
		const existingUser = await createUser({
			emailPrefix: 'registration-taken',
		});

		await submitRegistration(client, existingUser.email);

		queuedMails().assertNoneQueued();
	});
});

test.group('Registration — administrator rights', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(openRegistration);

	test('should not grant them to an account created after the first', async ({
		assert,
		client,
	}) => {
		await createUser({ emailPrefix: 'registration-existing' });
		const email = nextEmail();

		await submitRegistration(client, email);

		const registeredUser = await User.findByOrFail('email', email);
		assert.isFalse(registeredUser.isAdmin);
	});
});

test.group('Registration — throttling', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(openRegistration);

	test('should answer 429 once the burst quota is spent', async ({
		client,
	}) => {
		const clientAddress = nextClientAddress();
		const attempt = () =>
			client
				.post('/register')
				.header('x-forwarded-for', clientAddress)
				.form(registrationForm(nextEmail()))
				.withCsrfToken()
				.redirects(0);

		for (let index = 0; index < REGISTRATION_BURST_TIER.requests; index += 1) {
			await attempt();
		}
		const response = await attempt();

		response.assertStatus(429);
	});
});
