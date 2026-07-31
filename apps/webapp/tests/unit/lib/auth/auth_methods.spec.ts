import { test } from '@japa/runner';

import User from '#models/user';
import OauthAuth from '#models/oauth_auth';
import PasswordAuth from '#models/password_auth';
import { listAuthMethods } from '#lib/auth/auth_methods';
import { AUTH_PROVIDER, PASSWORD_AUTH_METHOD } from '#constants/auth';

function accountWithPassword(): User {
	const user = new User();
	user.$setRelated('passwordAuth', new PasswordAuth());

	return user;
}

function accountWithGoogle(): User {
	const user = new User();
	const oauthAuth = new OauthAuth();
	oauthAuth.provider = AUTH_PROVIDER.GOOGLE;
	user.$setRelated('oauthAuths', [oauthAuth]);

	return user;
}

test.group('listAuthMethods', () => {
	test('should report a password as a sign-in method', ({ assert }) => {
		assert.deepEqual(listAuthMethods(accountWithPassword()), [
			PASSWORD_AUTH_METHOD,
		]);
	});

	test('should report every linked provider', ({ assert }) => {
		assert.deepEqual(listAuthMethods(accountWithGoogle()), [
			AUTH_PROVIDER.GOOGLE,
		]);
	});

	test('should report both when an account holds both', ({ assert }) => {
		const user = accountWithGoogle();
		user.$setRelated('passwordAuth', new PasswordAuth());

		assert.sameMembers(listAuthMethods(user), [
			PASSWORD_AUTH_METHOD,
			AUTH_PROVIDER.GOOGLE,
		]);
	});

	test('should report nothing for an account holding neither', ({ assert }) => {
		const user = new User();
		user.$setRelated('oauthAuths', []);

		assert.isEmpty(listAuthMethods(user));
	});

	test('should report nothing when the relations were never loaded', ({
		assert,
	}) => {
		assert.isEmpty(listAuthMethods(new User()));
	});
});
