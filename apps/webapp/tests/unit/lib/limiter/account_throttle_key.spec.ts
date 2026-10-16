import { test } from '@japa/runner';
import { createHash } from 'node:crypto';

import { deriveAccountThrottleKey } from '#lib/limiter/account_throttle_key';

const SECRET = 'test-secret-with-enough-length-0123456789';
const EMAIL = 'someone@example.com';

test.group('deriveAccountThrottleKey', () => {
	test('should not equal the plain sha256 of the email', ({ assert }) => {
		const plainDigest = createHash('sha256').update(EMAIL).digest('hex');

		assert.notEqual(deriveAccountThrottleKey(EMAIL, SECRET), plainDigest);
	});

	test('should return the same key for the same email and secret', ({
		assert,
	}) => {
		assert.equal(
			deriveAccountThrottleKey(EMAIL, SECRET),
			deriveAccountThrottleKey(EMAIL, SECRET)
		);
	});

	test('should return a different key when the secret differs', ({
		assert,
	}) => {
		assert.notEqual(
			deriveAccountThrottleKey(EMAIL, SECRET),
			deriveAccountThrottleKey(EMAIL, `${SECRET}-rotated`)
		);
	});

	test('should return a different key for a different email', ({ assert }) => {
		assert.notEqual(
			deriveAccountThrottleKey(EMAIL, SECRET),
			deriveAccountThrottleKey('other@example.com', SECRET)
		);
	});
});
