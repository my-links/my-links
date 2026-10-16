import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import OauthAuth from '#models/oauth_auth';
import { freshSudoSession } from '#tests/helpers/sudo_mode';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import {
	OAUTH_INTENT,
	OAUTH_INTENT_SESSION_KEY,
} from '#services/auth/oauth_intent_service';
import {
	createUser,
	linkOauthIdentity,
	setUserPassword,
} from '#tests/factories/user_factory';

const PASSWORD = 'correct-horse-battery-staple';
const START_GOOGLE_PATH = '/auth/google';
const LINK_GOOGLE_PATH = '/account/providers/google';
const SUDO_GOOGLE_PATH = '/sudo/google';
const CALLBACK_PATH = '/auth/callback';
const STATE_COOKIE_NAME = 'google_oauth_state';
const ATTACKER_CODE = 'attacker-authorization-code';
const COOKIE_STATE = 'state-held-in-the-cookie';
const OTHER_STATE = 'state-from-another-round-trip';
const EXPIRED_MESSAGE = 'Request expired. Retry again';

function enableGoogleAuth() {
	app.container.swap(GoogleAuthConfigService, () => ({ isEnabled: true }));
}

function stateOf(location: unknown): string | null {
	return new URL(String(location)).searchParams.get('state');
}

test.group('OAuth state: starting the round trip', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.teardown(() => app.container.restore(GoogleAuthConfigService));

	test('should send a state parameter when signing in with google', async ({
		assert,
		client,
	}) => {
		enableGoogleAuth();

		const response = await client.get(START_GOOGLE_PATH).redirects(0);

		assert.isNotEmpty(stateOf(response.headers().location));
	});

	test('should set the state cookie when signing in with google', async ({
		assert,
		client,
	}) => {
		enableGoogleAuth();

		const response = await client.get(START_GOOGLE_PATH).redirects(0);

		assert.isDefined(response.cookie(STATE_COOKIE_NAME)?.value);
	});

	test('should send the state that the cookie holds', async ({
		assert,
		client,
	}) => {
		enableGoogleAuth();

		const response = await client.get(START_GOOGLE_PATH).redirects(0);

		assert.equal(
			response.cookie(STATE_COOKIE_NAME)?.value,
			stateOf(response.headers().location)
		);
	});

	test('should send a state parameter when linking a provider', async ({
		assert,
		client,
	}) => {
		enableGoogleAuth();
		const user = await createUser({ emailPrefix: 'state-link' });
		await setUserPassword(user, PASSWORD);

		const response = await client
			.get(LINK_GOOGLE_PATH)
			.loginAs(user)
			.withSession(freshSudoSession())
			.redirects(0);

		assert.isNotEmpty(stateOf(response.headers().location));
		assert.isDefined(response.cookie(STATE_COOKIE_NAME)?.value);
	});

	test('should send a state parameter when confirming sudo mode with google', async ({
		assert,
		client,
	}) => {
		enableGoogleAuth();
		const user = await createUser({ emailPrefix: 'state-sudo' });
		await linkOauthIdentity(user, 'google-state-sudo');

		const response = await client
			.get(SUDO_GOOGLE_PATH)
			.loginAs(user)
			.redirects(0);

		assert.isNotEmpty(stateOf(response.headers().location));
		assert.isDefined(response.cookie(STATE_COOKIE_NAME)?.value);
	});
});

test.group('OAuth state: the callback', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.teardown(() => app.container.restore(GoogleAuthConfigService));

	test('should refuse a code that arrives without any state', async ({
		client,
	}) => {
		enableGoogleAuth();

		const response = await client
			.get(CALLBACK_PATH)
			.qs({ code: ATTACKER_CODE })
			.redirects(0);

		response.assertFlashMessage('error', EXPIRED_MESSAGE);
	});

	test('should refuse a code with an empty state', async ({ client }) => {
		enableGoogleAuth();

		const response = await client
			.get(CALLBACK_PATH)
			.qs({ code: ATTACKER_CODE, state: '' })
			.redirects(0);

		response.assertFlashMessage('error', EXPIRED_MESSAGE);
	});

	test('should not sign anyone in when the state is missing', async ({
		client,
	}) => {
		enableGoogleAuth();

		const response = await client
			.get(CALLBACK_PATH)
			.qs({ code: ATTACKER_CODE })
			.redirects(0);

		response.assertHeader('location', '/');
	});

	test('should not link a provider when the state is missing', async ({
		assert,
		client,
	}) => {
		enableGoogleAuth();
		const user = await createUser({ emailPrefix: 'state-missing-link' });

		await client
			.get(CALLBACK_PATH)
			.qs({ code: ATTACKER_CODE })
			.loginAs(user)
			.withSession({ [OAUTH_INTENT_SESSION_KEY]: OAUTH_INTENT.PROVIDER_LINK })
			.redirects(0);

		const linkedAccounts = await OauthAuth.query().where('user_id', user.id);
		assert.lengthOf(linkedAccounts, 0);
	});

	test('should refuse a state that does not match the cookie', async ({
		client,
	}) => {
		enableGoogleAuth();

		const response = await client
			.get(CALLBACK_PATH)
			.qs({ code: ATTACKER_CODE, state: OTHER_STATE })
			.encryptedCookie(STATE_COOKIE_NAME, COOKIE_STATE)
			.redirects(0);

		response.assertFlashMessage('error', EXPIRED_MESSAGE);
	});

	test('should not create an account when the state does not match', async ({
		assert,
		client,
	}) => {
		enableGoogleAuth();
		const usersBefore = await User.query().count('* as total').firstOrFail();

		await client
			.get(CALLBACK_PATH)
			.qs({ code: ATTACKER_CODE, state: OTHER_STATE })
			.encryptedCookie(STATE_COOKIE_NAME, COOKIE_STATE)
			.redirects(0);

		const usersAfter = await User.query().count('* as total').firstOrFail();
		assert.equal(usersAfter.$extras.total, usersBefore.$extras.total);
	});
});
