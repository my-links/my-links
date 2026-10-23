import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import type { ApiClient } from '@japa/api-client';
import { test } from '@japa/runner';

import { AUTH_EVENT_TYPE, AUTH_PROVIDER } from '#constants/auth';
import { REGISTRATION_CONFIRMATION_MESSAGES } from '#controllers/auth/register_controller';
import { SETUP_LINK_REQUIRED_MESSAGE } from '#exceptions/auth/setup_link_required_exception';
import {
	ADMIN_SETUP_TOKEN_MINIMUM_LENGTH,
	resolveAdminSetupToken,
} from '#lib/auth/admin_setup_token';
import { REGISTRATION_BURST_TIER } from '#lib/limiter/attempt_tiers';
import { NO_REQUEST_ORIGIN } from '#lib/request_origin';
import { VerifyEmailNotification } from '#mails/verify_email_notification';
import AuditEvent from '#models/audit_event';
import Collection from '#models/collection';
import User from '#models/user';
import { AdminSetupService } from '#services/auth/admin_setup_service';
import { OauthAccountService } from '#services/auth/oauth_account_service';
import { RegistrationPolicyService } from '#services/auth/registration_policy_service';
import { AccountQueryService } from '#services/user/account_query_service';
import env from '#start/env';
import {
	createAdmin,
	createUser,
	linkOauthIdentity,
} from '#tests/factories/user_factory';
import { nextClientAddress } from '#tests/helpers/client_addresses';
import { enableOutgoingMail, queuedMails } from '#tests/helpers/outgoing_mail';

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
 * Past the bootstrap window, the default policy answers "closed", which is the
 * very thing most of these tests are not about. Overriding the decision keeps
 * them focused on what happens once a visitor is allowed through.
 */
class AlwaysOpenRegistrationPolicyService extends RegistrationPolicyService {
	override async isOpen(): Promise<boolean> {
		return true;
	}

	override async isSetupWindow(): Promise<boolean> {
		return false;
	}
}

function openRegistration() {
	app.container.swap(
		RegistrationPolicyService,
		async () =>
			new AlwaysOpenRegistrationPolicyService(
				await app.container.make(AccountQueryService),
				await app.container.make(AdminSetupService)
			)
	);

	return () => app.container.restore(RegistrationPolicyService);
}

function submitRegistration(
	client: ApiClient,
	email: string,
	setupToken?: string
) {
	return client
		.post('/register')
		.header('x-forwarded-for', nextClientAddress())
		.form({ ...registrationForm(email), ...(setupToken && { setupToken }) })
		.withCsrfToken()
		.redirects(0);
}

/**
 * The registration mechanics below do not care how the visitor got in. The
 * setup window that turns token-less sign-ups away has its own groups.
 */
function openPolicyForTheGroup(group: {
	each: {
		setup: (hook: () => void) => void;
		teardown: (hook: () => void) => void;
	};
}) {
	group.each.setup(() => env.set('ALLOW_REGISTRATION', 'open'));
	group.each.teardown(() => env.set('ALLOW_REGISTRATION', ''));
}

test.group('Registration: a brand new instance', (group) => {
	openPolicyForTheGroup(group);
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

	test('should open an Inbox for the new account', async ({
		assert,
		client,
	}) => {
		const email = nextEmail();

		await submitRegistration(client, email);

		const registeredUser = await User.findByOrFail('email', email);
		const inbox = await Collection.query()
			.where('author_id', registeredUser.id)
			.andWhere('is_default', true)
			.first();
		assert.isNotNull(inbox);
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
		// Registration journals the account's Inbox too, so the row has to be
		// asked for by type rather than taken as the account's only one.
		const event = await AuditEvent.query()
			.where('userId', registeredUser.id)
			.andWhere('type', AUTH_EVENT_TYPE.REGISTERED)
			.first();
		assert.isNotNull(event);
	});
});

test.group('Registration: an instance without outgoing mail', (group) => {
	openPolicyForTheGroup(group);
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
	'Registration: an instance that already has an administrator',
	(group) => {
		group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

		test('should stop rendering the register page once an administrator exists', async ({
			client,
		}) => {
			await createAdmin({ emailPrefix: 'registration-closed' });

			const response = await client.get('/register').redirects(0);

			response.assertHeader('location', HOME_PATH);
		});

		test('should refuse a submission once an administrator exists', async ({
			assert,
			client,
		}) => {
			await createAdmin({ emailPrefix: 'registration-closed' });
			const email = nextEmail();

			await submitRegistration(client, email);

			assert.isNull(await User.findBy('email', email));
		});
	}
);

test.group('Registration: an email address already registered', (group) => {
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

test.group('Registration: administrator rights', (group) => {
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

async function currentSetupToken(): Promise<string> {
	const adminSetupService = await app.container.make(AdminSetupService);

	return adminSetupService.setupToken;
}

test.group('Registration: the setup token', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(() => emptyInstance());
	group.each.teardown(() => app.container.restore(AdminSetupService));
	group.each.teardown(() => app.container.restore(RegistrationPolicyService));
	group.each.teardown(() => env.set('ALLOW_REGISTRATION', ''));

	test('should make the first account an administrator when it carries the setup token', async ({
		assert,
		client,
	}) => {
		const email = nextEmail();

		await submitRegistration(client, email, await currentSetupToken());

		const registeredUser = await User.findByOrFail('email', email);
		assert.isTrue(registeredUser.isAdmin);
	});

	test('should refuse a registration without the token while no administrator exists', async ({
		client,
	}) => {
		const response = await submitRegistration(client, nextEmail());

		response.assertFlashMessage('error', SETUP_LINK_REQUIRED_MESSAGE);
	});

	test('should create nothing when the token is missing during setup', async ({
		assert,
		client,
	}) => {
		const email = nextEmail();

		await submitRegistration(client, email);

		assert.isNull(await User.findBy('email', email));
	});

	test('should create nothing when the token is wrong during setup', async ({
		assert,
		client,
	}) => {
		const email = nextEmail();

		await submitRegistration(client, email, 'not-the-setup-token');

		assert.isNull(await User.findBy('email', email));
	});

	test('should let the setup link in although a regular account already exists', async ({
		assert,
		client,
	}) => {
		await createUser({ emailPrefix: 'setup-early-bird' });
		const email = nextEmail();

		await submitRegistration(client, email, await currentSetupToken());

		const registeredUser = await User.findByOrFail('email', email);
		assert.isTrue(registeredUser.isAdmin);
	});

	test('should keep accepting token-less registrations as regular users when the policy is open', async ({
		assert,
		client,
	}) => {
		env.set('ALLOW_REGISTRATION', 'open');
		const email = nextEmail();

		await submitRegistration(client, email);

		const registeredUser = await User.findByOrFail('email', email);
		assert.isFalse(registeredUser.isAdmin);
	});

	test('should still complete the registration when the token is wrong and the policy is open', async ({
		client,
	}) => {
		env.set('ALLOW_REGISTRATION', 'open');

		const response = await submitRegistration(
			client,
			nextEmail(),
			'not-the-setup-token'
		);

		response.assertHeader('location', LOGIN_PATH);
	});

	test('should ignore a valid token once an administrator exists', async ({
		assert,
		client,
	}) => {
		await createAdmin({ emailPrefix: 'setup-admin' });
		openRegistration();
		const email = nextEmail();

		await submitRegistration(client, email, await currentSetupToken());

		const registeredUser = await User.findByOrFail('email', email);
		assert.isFalse(registeredUser.isAdmin);
	});

	test('should accept the token an operator configured', async ({
		assert,
		client,
	}) => {
		const configuredToken = 'c'.repeat(ADMIN_SETUP_TOKEN_MINIMUM_LENGTH);
		app.container.swap(
			AdminSetupService,
			async () =>
				new AdminSetupService(
					await app.container.make(AccountQueryService),
					resolveAdminSetupToken(configuredToken)
				)
		);
		const email = nextEmail();

		await submitRegistration(client, email, configuredToken);

		const registeredUser = await User.findByOrFail('email', email);
		assert.isTrue(registeredUser.isAdmin);
	});

	test('should hand the token of the setup link to the register page', async ({
		client,
	}) => {
		const response = await client
			.get('/register?setup_token=from-the-link')
			.withInertia();

		response.assertInertiaPropsContains({ setupToken: 'from-the-link' });
	});

	test('should tell the register page the setup link is required without it', async ({
		client,
	}) => {
		const response = await client.get('/register').withInertia();

		response.assertInertiaPropsContains({ isSetupLinkRequired: true });
	});

	test('should tell the register page nothing is missing when the link carries the token', async ({
		client,
	}) => {
		const token = await currentSetupToken();

		const response = await client
			.get(`/register?setup_token=${token}`)
			.withInertia();

		response.assertInertiaPropsContains({ isSetupLinkRequired: false });
	});
});

test.group('Registration: Google sign-up during setup', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(() => emptyInstance());
	group.each.teardown(() => env.set('ALLOW_REGISTRATION', ''));

	const identity = {
		provider: AUTH_PROVIDER.GOOGLE,
		providerUserId: 'google-setup-newcomer',
		email: 'google-setup-newcomer@example.com',
		isEmailVerified: true,
		name: 'Newcomer',
		nickName: 'newcomer',
	};

	test('should refuse a new Google account while no administrator exists', async ({
		assert,
	}) => {
		const oauthAccountService = await app.container.make(OauthAccountService);

		await assert.rejects(
			() => oauthAccountService.authenticate(identity, NO_REQUEST_ORIGIN),
			/setup link/
		);
	});

	test('should create nothing when it refuses the Google account', async ({
		assert,
	}) => {
		const oauthAccountService = await app.container.make(OauthAccountService);

		await oauthAccountService
			.authenticate(identity, NO_REQUEST_ORIGIN)
			.catch(() => null);

		assert.isNull(await User.findBy('email', identity.email));
	});

	test('should sign in an existing Google account during setup', async ({
		assert,
	}) => {
		const existing = await createUser({ emailPrefix: 'google-setup-existing' });
		await linkOauthIdentity(existing, identity.providerUserId);
		const oauthAccountService = await app.container.make(OauthAccountService);

		const user = await oauthAccountService.authenticate(
			identity,
			NO_REQUEST_ORIGIN
		);

		assert.equal(user.id, existing.id);
	});

	test('should open a regular account for a new Google identity when the policy is open', async ({
		assert,
	}) => {
		env.set('ALLOW_REGISTRATION', 'open');
		const oauthAccountService = await app.container.make(OauthAccountService);

		const user = await oauthAccountService.authenticate(
			identity,
			NO_REQUEST_ORIGIN
		);

		assert.isFalse(user.isAdmin);
	});

	test('should open a regular account for a new Google identity once an administrator exists', async ({
		assert,
	}) => {
		await createAdmin({ emailPrefix: 'setup-admin' });
		const oauthAccountService = await app.container.make(OauthAccountService);

		const user = await oauthAccountService.authenticate(
			identity,
			NO_REQUEST_ORIGIN
		);

		assert.isFalse(user.isAdmin);
	});
});

test.group('Registration: throttling', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(openRegistration);

	test('should flash a message and redirect back once the burst quota is spent', async ({
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

		response.assertFlashMessage('error', 'Too many requests');
	});
});
