import { test } from '@japa/runner';

import { resolveGoogleAuthConfig } from '#lib/auth/google_config';
import IncompleteGoogleAuthConfigException from '#exceptions/auth/incomplete_google_auth_config_exception';

test.group('resolveGoogleAuthConfig', () => {
	test('should enable google auth when both credentials are provided', ({
		assert,
	}) => {
		const config = resolveGoogleAuthConfig('client-id', 'client-secret');

		assert.deepEqual(config, {
			isEnabled: true,
			clientId: 'client-id',
			clientSecret: 'client-secret',
		});
	});

	test('should disable google auth when no credential is provided', ({
		assert,
	}) => {
		const config = resolveGoogleAuthConfig(undefined, undefined);

		assert.deepEqual(config, { isEnabled: false });
	});

	test('should disable google auth when both credentials are empty strings', ({
		assert,
	}) => {
		const config = resolveGoogleAuthConfig('', '');

		assert.deepEqual(config, { isEnabled: false });
	});

	test('should throw when only the client id is provided', ({ assert }) => {
		assert.throws(
			() => resolveGoogleAuthConfig('client-id', undefined),
			/GOOGLE_CLIENT_SECRET/
		);
	});

	test('should throw when only the client secret is provided', ({ assert }) => {
		assert.throws(
			() => resolveGoogleAuthConfig(undefined, 'client-secret'),
			/GOOGLE_CLIENT_ID/
		);
	});

	test('should throw a typed exception on a partial configuration', ({
		assert,
	}) => {
		try {
			resolveGoogleAuthConfig('client-id', undefined);
			assert.fail('resolveGoogleAuthConfig should have thrown');
		} catch (error) {
			assert.instanceOf(error, IncompleteGoogleAuthConfigException);
		}
	});
});
