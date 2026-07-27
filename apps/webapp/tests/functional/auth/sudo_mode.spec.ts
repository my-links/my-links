import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';

import AuthEvent from '#models/auth_event';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { SUDO_CONFIRMATION_BURST_TIER } from '#start/limiter';
import { newPasswordForm } from '#tests/helpers/password_forms';
import { nextClientAddress } from '#tests/helpers/client_addresses';
import { freshSudoSession, staleSudoSession } from '#tests/helpers/sudo_mode';
import { SUDO_CONFIRMED_AT_SESSION_KEY } from '#services/auth/sudo_mode_service';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import {
	createUser,
	linkOauthIdentity,
	setUserPassword,
} from '#tests/factories/user_factory';

const VALID_PASSWORD = 'correct-horse-battery-staple';
const WRONG_PASSWORD = 'wrong-horse-battery-staple';
const SUDO_PATH = '/sudo';
const SUDO_GOOGLE_PATH = '/sudo/google';
const SETTINGS_PATH = '/user/settings';
const SET_PASSWORD_PATH = '/account/password';
const LOGIN_PATH = '/login';
const CONFIRMATION_FAILED_MESSAGE = 'That did not confirm your identity';

function disableGoogleAuth() {
	app.container.swap(GoogleAuthConfigService, () => ({ isEnabled: false }));
}

function enableGoogleAuth() {
	app.container.swap(GoogleAuthConfigService, () => ({ isEnabled: true }));
}

test.group('Sudo mode — the guard', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should send a signed-in user with no recent proof to the prompt', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-missing' });

		const response = await client
			.post(SET_PASSWORD_PATH)
			.form(newPasswordForm(VALID_PASSWORD))
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertHeader('location', SUDO_PATH);
	});

	test('should demand a new proof once the window has passed', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-stale' });

		const response = await client
			.post(SET_PASSWORD_PATH)
			.form(newPasswordForm(VALID_PASSWORD))
			.withCsrfToken()
			.loginAs(user)
			.withSession(staleSudoSession())
			.redirects(0);

		response.assertHeader('location', SUDO_PATH);
	});

	test('should let the request through while the proof is fresh', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-fresh' });

		const response = await client
			.post(SET_PASSWORD_PATH)
			.form(newPasswordForm(VALID_PASSWORD))
			.withCsrfToken()
			.loginAs(user)
			.withSession(freshSudoSession())
			.redirects(0);

		response.assertHeader('location', SETTINGS_PATH);
	});

	test('should send a guest to the login page rather than to the prompt', async ({
		client,
	}) => {
		const response = await client.get(SUDO_PATH).accept('html').redirects(0);

		response.assertHeader('location', LOGIN_PATH);
	});
});

test.group('Sudo mode — the prompt', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should offer the password field to an account that has a password', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-prompt-password' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client.get(SUDO_PATH).withInertia().loginAs(user);

		response.assertInertiaComponent('auth/sudo');
		response.assertInertiaPropsContains({ hasPassword: true });
	});

	test('should offer google confirmation to a linked account', async ({
		client,
	}) => {
		enableGoogleAuth();
		const user = await createUser({ emailPrefix: 'sudo-prompt-google' });
		await linkOauthIdentity(user, 'google-sudo-linked');

		const response = await client.get(SUDO_PATH).withInertia().loginAs(user);

		response.assertInertiaPropsContains({
			hasPassword: false,
			isGoogleConfirmationAvailable: true,
		});
	}).teardown(() => app.container.restore(GoogleAuthConfigService));

	test('should not offer google confirmation when the instance has no google', async ({
		client,
	}) => {
		disableGoogleAuth();
		const user = await createUser({ emailPrefix: 'sudo-prompt-nogoogle' });
		await linkOauthIdentity(user, 'google-sudo-disabled');

		const response = await client.get(SUDO_PATH).withInertia().loginAs(user);

		response.assertInertiaPropsContains({
			isGoogleConfirmationAvailable: false,
		});
	}).teardown(() => app.container.restore(GoogleAuthConfigService));

	test('should not offer google confirmation to an account that never linked it', async ({
		client,
	}) => {
		enableGoogleAuth();
		const user = await createUser({ emailPrefix: 'sudo-prompt-unlinked' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client.get(SUDO_PATH).withInertia().loginAs(user);

		response.assertInertiaPropsContains({
			isGoogleConfirmationAvailable: false,
		});
	}).teardown(() => app.container.restore(GoogleAuthConfigService));
});

test.group('Sudo mode — confirming with a password', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should stamp the proof when the account password is right', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-confirm' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post(SUDO_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ password: VALID_PASSWORD })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertSession(SUDO_CONFIRMED_AT_SESSION_KEY);
	});

	test('should return to the page the guard interrupted', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-return' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post(SUDO_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ password: VALID_PASSWORD })
			.withCsrfToken()
			.loginAs(user)
			.withSession({ sudo_return_url: SETTINGS_PATH })
			.redirects(0);

		response.assertHeader('location', SETTINGS_PATH);
	});

	test('should record a confirmed event', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'sudo-journal' });
		await setUserPassword(user, VALID_PASSWORD);

		await client
			.post(SUDO_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ password: VALID_PASSWORD })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const event = await AuthEvent.query()
			.where('userId', user.id)
			.firstOrFail();
		assert.equal(event.type, AUTH_EVENT_TYPE.SUDO_CONFIRMED);
	});

	test('should refuse a wrong password', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'sudo-wrong' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post(SUDO_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ password: WRONG_PASSWORD })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertFlashMessage('error', CONFIRMATION_FAILED_MESSAGE);
	});

	test('should stamp no proof when the password is wrong', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-wrong-guard' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post(SUDO_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ password: WRONG_PASSWORD })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertSessionMissing(SUDO_CONFIRMED_AT_SESSION_KEY);
	});

	test('should record a failed confirmation against the account', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-wrong-journal' });
		await setUserPassword(user, VALID_PASSWORD);

		await client
			.post(SUDO_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ password: WRONG_PASSWORD })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const event = await AuthEvent.query()
			.where('userId', user.id)
			.firstOrFail();
		assert.equal(event.type, AUTH_EVENT_TYPE.SUDO_CONFIRMATION_FAILED);
	});

	test('should refuse an account that has no password to check', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-nopassword' });

		const response = await client
			.post(SUDO_PATH)
			.header('x-forwarded-for', nextClientAddress())
			.form({ password: VALID_PASSWORD })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertFlashMessage('error', CONFIRMATION_FAILED_MESSAGE);
	});
});

test.group('Sudo mode — confirming through Google', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should hand a linked account over to the provider', async ({
		assert,
		client,
	}) => {
		enableGoogleAuth();
		const user = await createUser({ emailPrefix: 'sudo-google-start' });
		await linkOauthIdentity(user, 'google-sudo-start');

		const response = await client
			.get(SUDO_GOOGLE_PATH)
			.loginAs(user)
			.redirects(0);

		const location: unknown = response.headers().location;
		assert.isString(location);
		assert.include(String(location), 'accounts.google.com');
	}).teardown(() => app.container.restore(GoogleAuthConfigService));

	test('should arm the callback so it reads the identity as a confirmation', async ({
		client,
	}) => {
		enableGoogleAuth();
		const user = await createUser({ emailPrefix: 'sudo-google-armed' });
		await linkOauthIdentity(user, 'google-sudo-armed');

		const response = await client
			.get(SUDO_GOOGLE_PATH)
			.loginAs(user)
			.redirects(0);

		response.assertSession('sudo_pending_oauth', true);
	}).teardown(() => app.container.restore(GoogleAuthConfigService));

	test('should stamp no proof merely for starting the round trip', async ({
		client,
	}) => {
		enableGoogleAuth();
		const user = await createUser({ emailPrefix: 'sudo-google-unproven' });
		await linkOauthIdentity(user, 'google-sudo-unproven');

		const response = await client
			.get(SUDO_GOOGLE_PATH)
			.loginAs(user)
			.redirects(0);

		response.assertSessionMissing(SUDO_CONFIRMED_AT_SESSION_KEY);
	}).teardown(() => app.container.restore(GoogleAuthConfigService));

	test('should refuse an account that never linked google', async ({
		client,
	}) => {
		enableGoogleAuth();
		const user = await createUser({ emailPrefix: 'sudo-google-unlinked' });
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.get(SUDO_GOOGLE_PATH)
			.loginAs(user)
			.redirects(0);

		response.assertFlashMessage('error', CONFIRMATION_FAILED_MESSAGE);
	}).teardown(() => app.container.restore(GoogleAuthConfigService));

	test('should not exist on an instance without google', async ({ client }) => {
		disableGoogleAuth();
		const user = await createUser({ emailPrefix: 'sudo-google-off' });
		await linkOauthIdentity(user, 'google-sudo-off');

		const response = await client
			.get(SUDO_GOOGLE_PATH)
			.loginAs(user)
			.redirects(0);

		response.assertStatus(404);
	}).teardown(() => app.container.restore(GoogleAuthConfigService));
});

test.group('Sudo mode — throttling', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should answer 429 once the burst quota is spent', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'sudo-throttled' });
		await setUserPassword(user, VALID_PASSWORD);
		const clientAddress = nextClientAddress();
		const attempt = () =>
			client
				.post(SUDO_PATH)
				.header('x-forwarded-for', clientAddress)
				.form({ password: WRONG_PASSWORD })
				.withCsrfToken()
				.loginAs(user)
				.redirects(0);

		for (
			let index = 0;
			index < SUDO_CONFIRMATION_BURST_TIER.requests;
			index += 1
		) {
			await attempt();
		}
		const response = await attempt();

		response.assertStatus(429);
	});
});
