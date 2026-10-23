import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import type { ApiClient } from '@japa/api-client';
import { test } from '@japa/runner';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { LOGIN_BURST_TIER } from '#lib/limiter/attempt_tiers';
import AuditEvent from '#models/audit_event';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import {
	createUser,
	setUserPassword,
	verifyUserEmail,
} from '#tests/factories/user_factory';
import { nextClientAddress } from '#tests/helpers/client_addresses';

const VALID_PASSWORD = 'correct-horse-battery-staple';
const NEW_PASSWORD = 'brand-new-horse-battery-staple';
const WRONG_PASSWORD = 'wrong-horse-battery-staple';
const UNKNOWN_EMAIL = 'nobody@example.com';
const THROTTLED_EMAIL = 'throttled@example.com';
const GENERIC_FAILURE_MESSAGE = 'Invalid email address or password';
const SESSION_GUARD_KEY = 'auth_web';
const KNOWN_DEVICES_COOKIE = 'known_devices';

function disableGoogleAuth() {
	app.container.swap(GoogleAuthConfigService, () => ({ isEnabled: false }));
}

test.group('Login: page', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should render the login page to a guest', async ({ client }) => {
		const response = await client.get('/login').withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('auth/login');
	});

	test('should advertise credentials as an available provider', async ({
		client,
	}) => {
		disableGoogleAuth();

		const response = await client.get('/login').withInertia();

		response.assertInertiaPropsContains({
			authProviders: { isCredentialsEnabled: true, isGoogleEnabled: false },
		});
	}).teardown(() => app.container.restore(GoogleAuthConfigService));

	test('should send a guest hitting a protected route to the login page even without google', async ({
		client,
	}) => {
		disableGoogleAuth();

		// A browser is what this guards: the auth guard only redirects when the
		// client asks for HTML, and answers 401 to everything else.
		const response = await client
			.get('/collections/favorites')
			.accept('html')
			.redirects(0);

		response.assertHeader('location', '/login');
	}).teardown(() => app.container.restore(GoogleAuthConfigService));
});

test.group('Login: credentials', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should authenticate the account when the credentials are valid', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'login' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		response.assertSession(SESSION_GUARD_KEY, user.id);
	});

	test('should redirect to the landing dispatcher when the credentials are valid', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'login' });
		await verifyUserEmail(user);
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		response.assertHeader('location', '/');
	});

	test('should record a succeeded login event', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'login' });
		await setUserPassword(user, VALID_PASSWORD);

		await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.orderBy('id', 'desc')
			.firstOrFail();
		assert.equal(event.type, AUTH_EVENT_TYPE.LOGIN_SUCCEEDED);
	});

	test('should leave the visitor unauthenticated when the password is wrong', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'login' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: WRONG_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		response.assertSessionMissing(SESSION_GUARD_KEY);
	});

	test('should answer a wrong password with the generic failure message', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'login' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: WRONG_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		response.assertFlashMessage('error', GENERIC_FAILURE_MESSAGE);
	});

	test('should answer an unknown email with the very same failure message', async ({
		client,
	}) => {
		const response = await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: UNKNOWN_EMAIL, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		response.assertFlashMessage('error', GENERIC_FAILURE_MESSAGE);
	});

	test('should record a failed login event without an account when the email is unknown', async ({
		assert,
		client,
	}) => {
		await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: UNKNOWN_EMAIL, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		const event = await AuditEvent.query().orderBy('id', 'desc').firstOrFail();
		assert.deepEqual(
			{ type: event.type, userId: event.userId },
			{ type: AUTH_EVENT_TYPE.LOGIN_FAILED, userId: null }
		);
	});
});

async function createVerifiedUserWithPassword() {
	const user = await createUser({ emailPrefix: 'login-throttle' });
	await verifyUserEmail(user);
	await setUserPassword(user, VALID_PASSWORD);

	return user;
}

function postLogin(
	client: ApiClient,
	email: string,
	password: string,
	clientAddress: string,
	knownDevicesCookie: unknown = null
) {
	const request = client
		.post('/login')
		.header('x-forwarded-for', clientAddress)
		.form({ email, password })
		.withCsrfToken()
		.redirects(0);

	return knownDevicesCookie
		? request.plainCookie(KNOWN_DEVICES_COOKIE, knownDevicesCookie)
		: request;
}

async function signInAndTakeDeviceCookie(
	client: ApiClient,
	email: string
): Promise<unknown> {
	const response = await postLogin(
		client,
		email,
		VALID_PASSWORD,
		nextClientAddress()
	);

	return response.cookie(KNOWN_DEVICES_COOKIE)?.value;
}

async function exhaustSharedBudget(client: ApiClient, email: string) {
	for (let index = 0; index < LOGIN_BURST_TIER.requests; index += 1) {
		await postLogin(client, email, WRONG_PASSWORD, nextClientAddress());
	}
}

test.group('Login: throttling', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should flash a message and redirect back once the burst quota is spent', async ({
		client,
	}) => {
		const clientAddress = nextClientAddress();
		const attempt = () =>
			client
				.post('/login')
				.header('x-forwarded-for', clientAddress)
				.form({ email: THROTTLED_EMAIL, password: WRONG_PASSWORD })
				.withCsrfToken()
				.redirects(0);

		for (let index = 0; index < LOGIN_BURST_TIER.requests; index += 1) {
			await attempt();
		}
		const response = await attempt();

		response.assertFlashMessage('error', 'Too many requests');
	});

	test('should throttle the address on every request, successful ones included', async ({
		client,
	}) => {
		const clientAddress = nextClientAddress();
		const user = await createVerifiedUserWithPassword();
		for (let index = 0; index < LOGIN_BURST_TIER.requests; index += 1) {
			await postLogin(client, user.email, VALID_PASSWORD, clientAddress);
		}

		const response = await postLogin(
			client,
			user.email,
			VALID_PASSWORD,
			clientAddress
		);

		response.assertFlashMessage('error', 'Too many requests');
	});

	test('should never throttle the account however many sign-ins succeed', async ({
		client,
	}) => {
		const user = await createVerifiedUserWithPassword();
		for (let index = 0; index <= LOGIN_BURST_TIER.requests; index += 1) {
			await postLogin(client, user.email, VALID_PASSWORD, nextClientAddress());
		}

		const response = await postLogin(
			client,
			user.email,
			VALID_PASSWORD,
			nextClientAddress()
		);

		response.assertHeader('location', '/');
	});

	test('should throttle the account once failures from many addresses exhaust its budget', async ({
		client,
	}) => {
		const user = await createVerifiedUserWithPassword();
		for (let index = 0; index < LOGIN_BURST_TIER.requests; index += 1) {
			await postLogin(client, user.email, WRONG_PASSWORD, nextClientAddress());
		}

		const response = await postLogin(
			client,
			user.email,
			VALID_PASSWORD,
			nextClientAddress()
		);

		response.assertFlashMessage('error', 'Too many requests');
	});

	test('should reset the failure count of the account on a successful sign-in', async ({
		client,
	}) => {
		const user = await createVerifiedUserWithPassword();
		const failuresBeforeBudget = LOGIN_BURST_TIER.requests - 1;
		for (let index = 0; index < failuresBeforeBudget; index += 1) {
			await postLogin(client, user.email, WRONG_PASSWORD, nextClientAddress());
		}
		await postLogin(client, user.email, VALID_PASSWORD, nextClientAddress());
		for (let index = 0; index < failuresBeforeBudget; index += 1) {
			await postLogin(client, user.email, WRONG_PASSWORD, nextClientAddress());
		}

		const response = await postLogin(
			client,
			user.email,
			VALID_PASSWORD,
			nextClientAddress()
		);

		response.assertHeader('location', '/');
	});

	test('should let a known device sign in after strangers exhaust the shared budget', async ({
		client,
	}) => {
		const user = await createVerifiedUserWithPassword();
		const deviceCookie = await signInAndTakeDeviceCookie(client, user.email);
		await exhaustSharedBudget(client, user.email);

		const response = await postLogin(
			client,
			user.email,
			VALID_PASSWORD,
			nextClientAddress(),
			deviceCookie
		);

		response.assertHeader('location', '/');
	});

	test('should throttle a known device on its own budget when it keeps failing', async ({
		client,
	}) => {
		const user = await createVerifiedUserWithPassword();
		const deviceCookie = await signInAndTakeDeviceCookie(client, user.email);
		for (let index = 0; index < LOGIN_BURST_TIER.requests; index += 1) {
			await postLogin(
				client,
				user.email,
				WRONG_PASSWORD,
				nextClientAddress(),
				deviceCookie
			);
		}

		const response = await postLogin(
			client,
			user.email,
			VALID_PASSWORD,
			nextClientAddress(),
			deviceCookie
		);

		response.assertFlashMessage('error', 'Too many requests');
	});

	test('should give no bypass on another account to the device cookie of an account', async ({
		client,
	}) => {
		const owner = await createVerifiedUserWithPassword();
		const victim = await createVerifiedUserWithPassword();
		const ownerDeviceCookie = await signInAndTakeDeviceCookie(
			client,
			owner.email
		);
		await exhaustSharedBudget(client, victim.email);

		const response = await postLogin(
			client,
			victim.email,
			VALID_PASSWORD,
			nextClientAddress(),
			ownerDeviceCookie
		);

		response.assertFlashMessage('error', 'Too many requests');
	});

	test('should give no bypass to a device cookie issued before a password change', async ({
		client,
	}) => {
		const user = await createVerifiedUserWithPassword();
		const deviceCookie = await signInAndTakeDeviceCookie(client, user.email);
		const passwordAuth = await user
			.related('passwordAuth')
			.query()
			.firstOrFail();
		passwordAuth.password = NEW_PASSWORD;
		await passwordAuth.save();
		await exhaustSharedBudget(client, user.email);

		const response = await postLogin(
			client,
			user.email,
			NEW_PASSWORD,
			nextClientAddress(),
			deviceCookie
		);

		response.assertFlashMessage('error', 'Too many requests');
	});

	test('should keep throttling a visitor without a device cookie on the shared budget', async ({
		client,
	}) => {
		const user = await createVerifiedUserWithPassword();
		await exhaustSharedBudget(client, user.email);

		const response = await postLogin(
			client,
			user.email,
			VALID_PASSWORD,
			nextClientAddress()
		);

		response.assertFlashMessage('error', 'Too many requests');
	});
});
