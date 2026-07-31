import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import type { ApiClient } from '@japa/api-client';
import testUtils from '@adonisjs/core/services/test_utils';

import type User from '#models/user';
import OauthAuth from '#models/oauth_auth';
import AuthEvent from '#models/auth_event';
import { freshSudoSession } from '#tests/helpers/sudo_mode';
import { AUTH_EVENT_TYPE, AUTH_PROVIDER } from '#constants/auth';
import type { OauthIdentity } from '#services/auth/oauth_account_service';
import { ProviderLinkService } from '#services/auth/provider_link_service';
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
const LINK_GOOGLE_PATH = '/account/providers/google';
const UNLINK_GOOGLE_PATH = '/account/providers/google';
const SUDO_PATH = '/sudo';
const SETTINGS_PATH = '/user/settings';
const LAST_METHOD_MESSAGE =
	'This is the only way left to sign in to this account — add another one before removing it';

let providerUserIdCounter = 0;

function googleIdentity(): OauthIdentity {
	providerUserIdCounter += 1;

	return {
		provider: AUTH_PROVIDER.GOOGLE,
		providerUserId: `google-link-${Date.now()}-${providerUserIdCounter}`,
		email: `linked-${providerUserIdCounter}@example.com`,
		isEmailVerified: true,
		name: 'Ada Lovelace',
		nickName: 'ada',
		avatarUrl: null,
	};
}

function enableGoogleAuth() {
	app.container.swap(GoogleAuthConfigService, () => ({ isEnabled: true }));
}

function disableGoogleAuth() {
	app.container.swap(GoogleAuthConfigService, () => ({ isEnabled: false }));
}

function unlinkGoogle(client: ApiClient, user: User) {
	return client
		.delete(UNLINK_GOOGLE_PATH)
		.withCsrfToken()
		.loginAs(user)
		.withSession(freshSudoSession())
		.redirects(0);
}

function countLinksOf(user: User): Promise<OauthAuth[]> {
	return OauthAuth.query().where('userId', user.id);
}

test.group('Provider linking — attaching an identity', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should attach the identity to the account that asked for it', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'link-attach' });
		await setUserPassword(user, PASSWORD);
		const identity = googleIdentity();
		const providerLinkService = await app.container.make(ProviderLinkService);

		await providerLinkService.link(user, identity);

		const links = await countLinksOf(user);
		assert.lengthOf(links, 1);
		assert.equal(links[0].providerUserId, identity.providerUserId);
	});

	test('should refuse an identity another account already linked', async ({
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'link-owner' });
		const identity = googleIdentity();
		await linkOauthIdentity(owner, identity.providerUserId);
		const newcomer = await createUser({ emailPrefix: 'link-newcomer' });
		await setUserPassword(newcomer, PASSWORD);
		const providerLinkService = await app.container.make(ProviderLinkService);

		await assert.rejects(() => providerLinkService.link(newcomer, identity));
		assert.isEmpty(await countLinksOf(newcomer));
	});

	test('should refuse an identity the account already holds', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'link-again' });
		const identity = googleIdentity();
		await linkOauthIdentity(user, identity.providerUserId);
		const providerLinkService = await app.container.make(ProviderLinkService);

		await assert.rejects(() => providerLinkService.link(user, identity));
		assert.lengthOf(await countLinksOf(user), 1);
	});

	test('should refuse a second identity for a provider the account already uses', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'link-slot' });
		await linkOauthIdentity(user, 'google-slot-taken');
		const providerLinkService = await app.container.make(ProviderLinkService);

		await assert.rejects(() =>
			providerLinkService.link(user, googleIdentity())
		);
		assert.lengthOf(await countLinksOf(user), 1);
	});
});

test.group('Provider linking — starting the round trip', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());
	group.each.teardown(() => app.container.restore(GoogleAuthConfigService));

	test('should hand the visitor over to the provider', async ({
		assert,
		client,
	}) => {
		enableGoogleAuth();
		const user = await createUser({ emailPrefix: 'link-start' });
		await setUserPassword(user, PASSWORD);

		const response = await client
			.get(LINK_GOOGLE_PATH)
			.loginAs(user)
			.withSession(freshSudoSession())
			.redirects(0);

		const location: unknown = response.headers().location;
		assert.isString(location);
		assert.include(String(location), 'accounts.google.com');
	});

	test('should arm the callback so it reads the identity as a link', async ({
		client,
	}) => {
		enableGoogleAuth();
		const user = await createUser({ emailPrefix: 'link-armed' });
		await setUserPassword(user, PASSWORD);

		const response = await client
			.get(LINK_GOOGLE_PATH)
			.loginAs(user)
			.withSession(freshSudoSession())
			.redirects(0);

		response.assertSession(
			OAUTH_INTENT_SESSION_KEY,
			OAUTH_INTENT.PROVIDER_LINK
		);
	});

	test('should demand a recent proof of identity first', async ({ client }) => {
		enableGoogleAuth();
		const user = await createUser({ emailPrefix: 'link-sudo' });
		await setUserPassword(user, PASSWORD);

		const response = await client
			.get(LINK_GOOGLE_PATH)
			.loginAs(user)
			.redirects(0);

		response.assertHeader('location', SUDO_PATH);
	});

	test('should not exist on an instance without google', async ({ client }) => {
		disableGoogleAuth();
		const user = await createUser({ emailPrefix: 'link-nogoogle' });
		await setUserPassword(user, PASSWORD);

		const response = await client
			.get(LINK_GOOGLE_PATH)
			.loginAs(user)
			.withSession(freshSudoSession())
			.redirects(0);

		response.assertStatus(404);
	});
});

test.group('Provider linking — detaching an identity', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should detach the provider when another method remains', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'unlink-ok' });
		await setUserPassword(user, PASSWORD);
		await linkOauthIdentity(user, 'google-unlink-ok');

		const response = await unlinkGoogle(client, user);

		response.assertHeader('location', SETTINGS_PATH);
		assert.isEmpty(await countLinksOf(user));
	});

	test('should record an unlinked event', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'unlink-journal' });
		await setUserPassword(user, PASSWORD);
		await linkOauthIdentity(user, 'google-unlink-journal');

		await unlinkGoogle(client, user);

		const event = await AuthEvent.query()
			.where('userId', user.id)
			.firstOrFail();
		assert.equal(event.type, AUTH_EVENT_TYPE.PROVIDER_UNLINKED);
	});

	test('should refuse to detach the only way left to sign in', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'unlink-last' });
		await linkOauthIdentity(user, 'google-unlink-last');

		const response = await unlinkGoogle(client, user);

		response.assertFlashMessage('error', LAST_METHOD_MESSAGE);
		assert.lengthOf(await countLinksOf(user), 1);
	});

	test('should refuse a provider the account never linked', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'unlink-absent' });
		await setUserPassword(user, PASSWORD);

		const response = await unlinkGoogle(client, user);

		response.assertFlashMessage(
			'error',
			'This account is not linked to that provider'
		);
	});

	test('should demand a recent proof of identity first', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'unlink-sudo' });
		await setUserPassword(user, PASSWORD);
		await linkOauthIdentity(user, 'google-unlink-sudo');

		const response = await client
			.delete(UNLINK_GOOGLE_PATH)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertHeader('location', SUDO_PATH);
		assert.lengthOf(await countLinksOf(user), 1);
	});

	test('should reject a provider it does not know', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'unlink-unknown' });
		await setUserPassword(user, PASSWORD);
		await linkOauthIdentity(user, 'google-unlink-unknown');

		await client
			.delete('/account/providers/facebook')
			.withCsrfToken()
			.loginAs(user)
			.withSession(freshSudoSession())
			.redirects(0);

		assert.lengthOf(await countLinksOf(user), 1);
	});
});

test.group('Provider linking — what the settings page reports', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should list the providers the account has linked', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'settings-linked' });
		await setUserPassword(user, PASSWORD);
		await linkOauthIdentity(user, 'google-settings-linked');

		const response = await client
			.get(SETTINGS_PATH)
			.withInertia()
			.loginAs(user);

		response.assertInertiaPropsContains({
			linkedProviders: [{ provider: AUTH_PROVIDER.GOOGLE }],
			canUnlinkProvider: true,
		});
	});

	test('should report a sole provider as impossible to unlink', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'settings-sole' });
		await linkOauthIdentity(user, 'google-settings-sole');

		const response = await client
			.get(SETTINGS_PATH)
			.withInertia()
			.loginAs(user);

		response.assertInertiaPropsContains({ canUnlinkProvider: false });
	});
});
