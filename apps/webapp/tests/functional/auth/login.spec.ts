import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';

import AuditEvent from '#models/audit_event';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { LOGIN_BURST_TIER } from '#start/limiter';
import { nextClientAddress } from '#tests/helpers/client_addresses';
import { createUser, setUserPassword } from '#tests/factories/user_factory';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';

const VALID_PASSWORD = 'correct-horse-battery-staple';
const WRONG_PASSWORD = 'wrong-horse-battery-staple';
const UNKNOWN_EMAIL = 'nobody@example.com';
const THROTTLED_EMAIL = 'throttled@example.com';
const GENERIC_FAILURE_MESSAGE = 'Invalid email address or password';
const SESSION_GUARD_KEY = 'auth_web';

function disableGoogleAuth() {
	app.container.swap(GoogleAuthConfigService, () => ({ isEnabled: false }));
}

test.group('Login — page', (group) => {
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

test.group('Login — credentials', (group) => {
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

test.group('Login — throttling', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 429 once the burst quota is spent', async ({
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

		response.assertStatus(429);
	});
});
