import { test } from '@japa/runner';

import {
	isMatchingSetupToken,
	parseAdminSetupToken,
	resolveAdminSetupToken,
	generateAdminSetupToken,
	ADMIN_SETUP_TOKEN_MINIMUM_LENGTH,
} from '#lib/auth/admin_setup_token';

const LONG_ENOUGH_TOKEN = 'a'.repeat(ADMIN_SETUP_TOKEN_MINIMUM_LENGTH);
const TOKEN_KEY = 'ADMIN_SETUP_TOKEN';

test.group('generateAdminSetupToken', () => {
	test('should produce a url-safe token of 32 random bytes', ({ assert }) => {
		assert.match(generateAdminSetupToken(), /^[\w-]{43}$/);
	});

	test('should produce a different token every time', ({ assert }) => {
		assert.notEqual(generateAdminSetupToken(), generateAdminSetupToken());
	});
});

test.group('resolveAdminSetupToken', () => {
	test('should use the configured token when there is one', ({ assert }) => {
		assert.equal(resolveAdminSetupToken(LONG_ENOUGH_TOKEN), LONG_ENOUGH_TOKEN);
	});

	test('should generate a token when none is configured', ({ assert }) => {
		assert.isAtLeast(
			resolveAdminSetupToken(undefined).length,
			ADMIN_SETUP_TOKEN_MINIMUM_LENGTH
		);
	});
});

test.group('parseAdminSetupToken', () => {
	test('should leave an unset value unset', ({ assert }) => {
		assert.isUndefined(parseAdminSetupToken(TOKEN_KEY, undefined));
	});

	test('should treat a blank value as unset', ({ assert }) => {
		assert.isUndefined(parseAdminSetupToken(TOKEN_KEY, '   '));
	});

	test('should accept a token of the minimum length', ({ assert }) => {
		assert.equal(
			parseAdminSetupToken(TOKEN_KEY, LONG_ENOUGH_TOKEN),
			LONG_ENOUGH_TOKEN
		);
	});

	test('should refuse a token that is too short', ({ assert }) => {
		assert.throws(() => parseAdminSetupToken(TOKEN_KEY, 'too-short'));
	});
});

test.group('isMatchingSetupToken', () => {
	test('should accept the expected token', ({ assert }) => {
		assert.isTrue(isMatchingSetupToken(LONG_ENOUGH_TOKEN, LONG_ENOUGH_TOKEN));
	});

	test('should refuse another token', ({ assert }) => {
		assert.isFalse(isMatchingSetupToken(LONG_ENOUGH_TOKEN, 'b'.repeat(40)));
	});

	test('should refuse a missing token', ({ assert }) => {
		assert.isFalse(isMatchingSetupToken(LONG_ENOUGH_TOKEN, undefined));
	});
});
