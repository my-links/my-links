import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import { AUTH_PROVIDER } from '#constants/auth';
import type { OauthIdentity } from '#services/auth/oauth_account_service';
import { OauthAccountService } from '#services/auth/oauth_account_service';
import { createUser, linkOauthIdentity } from '#tests/factories/user_factory';

const MIXED_CASE_EMAIL = 'Ada.Lovelace@Example.com';
const NORMALIZED_EMAIL = 'ada.lovelace@example.com';

let providerUserIdCounter = 0;

function googleIdentity(email: string): OauthIdentity {
	providerUserIdCounter += 1;

	return {
		provider: AUTH_PROVIDER.GOOGLE,
		providerUserId: `google-${Date.now()}-${providerUserIdCounter}`,
		email,
		isEmailVerified: true,
		name: 'Ada Lovelace',
		nickName: 'ada',
		avatarUrl: null,
	};
}

test.group('OAuth accounts — email normalization', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should store the address in the same case the registration form stores it', async ({
		assert,
	}) => {
		const oauthAccountService = await app.container.make(OauthAccountService);

		const user = await oauthAccountService.authenticate(
			googleIdentity(MIXED_CASE_EMAIL)
		);

		assert.equal(user.email, NORMALIZED_EMAIL);
	});

	test('should refuse an address an existing account already holds in another case', async ({
		assert,
	}) => {
		await User.create({ email: NORMALIZED_EMAIL, name: 'Ada Lovelace' });
		const oauthAccountService = await app.container.make(OauthAccountService);

		await assert.rejects(() =>
			oauthAccountService.authenticate(googleIdentity(MIXED_CASE_EMAIL))
		);
	});

	test('should keep resolving an identity it already linked', async ({
		assert,
	}) => {
		const existingUser = await createUser({ emailPrefix: 'oauth-linked' });
		const oauthAccountService = await app.container.make(OauthAccountService);
		const identity = googleIdentity(existingUser.email);
		await existingUser.related('oauthAuths').create({
			provider: identity.provider,
			providerUserId: identity.providerUserId,
			linkedAt: existingUser.createdAt,
		});

		const resolvedUser = await oauthAccountService.authenticate(identity);

		assert.equal(resolvedUser.id, existingUser.id);
	});
});

/**
 * What identity confirmation asks: not "who should this identity sign in as"
 * but "does this identity already belong to the session in front of me".
 */
test.group('OAuth accounts — resolving an identity to its owner', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should resolve a linked identity to the account holding it', async ({
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'oauth-owner' });
		const identity = googleIdentity(owner.email);
		await linkOauthIdentity(owner, identity.providerUserId);
		const oauthAccountService = await app.container.make(OauthAccountService);

		const linkedUser = await oauthAccountService.findLinkedUser(identity);

		assert.equal(linkedUser?.id, owner.id);
	});

	test('should resolve an identity nobody claimed to nothing', async ({
		assert,
	}) => {
		const oauthAccountService = await app.container.make(OauthAccountService);

		const linkedUser = await oauthAccountService.findLinkedUser(
			googleIdentity('stranger@example.com')
		);

		assert.isNull(linkedUser);
	});

	test('should report whether an account can prove itself through a provider', async ({
		assert,
	}) => {
		const linkedUser = await createUser({ emailPrefix: 'oauth-has-google' });
		const unlinkedUser = await createUser({ emailPrefix: 'oauth-no-google' });
		await linkOauthIdentity(linkedUser, 'google-has-provider');
		const oauthAccountService = await app.container.make(OauthAccountService);

		assert.isTrue(
			await oauthAccountService.hasLinkedProvider(
				linkedUser,
				AUTH_PROVIDER.GOOGLE
			)
		);
		assert.isFalse(
			await oauthAccountService.hasLinkedProvider(
				unlinkedUser,
				AUTH_PROVIDER.GOOGLE
			)
		);
	});
});
