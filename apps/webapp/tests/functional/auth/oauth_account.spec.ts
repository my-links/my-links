import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import { AUTH_PROVIDER } from '#constants/auth';
import { createUser } from '#tests/factories/user_factory';
import type { OauthIdentity } from '#services/auth/oauth_account_service';
import { OauthAccountService } from '#services/auth/oauth_account_service';

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
	group.each.setup(() => testUtils.db().withGlobalTransaction());

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
