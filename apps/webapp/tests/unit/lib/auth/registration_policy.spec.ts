import { test } from '@japa/runner';

import { REGISTRATION_POLICY } from '#constants/auth';
import { resolveRegistrationPolicy } from '#lib/auth/registration_policy';

test.group('Registration policy — configured by the operator', () => {
	test('should open registration when the operator asked for open', ({
		assert,
	}) => {
		const policy = resolveRegistrationPolicy({
			configuredPolicy: REGISTRATION_POLICY.OPEN,
			hasAnyAccount: true,
		});

		assert.isTrue(policy.isOpen);
	});

	test('should close registration when the operator asked for closed', ({
		assert,
	}) => {
		const policy = resolveRegistrationPolicy({
			configuredPolicy: REGISTRATION_POLICY.CLOSED,
			hasAnyAccount: false,
		});

		assert.isFalse(policy.isOpen);
	});
});

test.group('Registration policy — left to its default', () => {
	test('should open registration while the instance has no account', ({
		assert,
	}) => {
		const policy = resolveRegistrationPolicy({
			configuredPolicy: undefined,
			hasAnyAccount: false,
		});

		assert.isTrue(policy.isOpen);
	});

	test('should close registration once the instance has an account', ({
		assert,
	}) => {
		const policy = resolveRegistrationPolicy({
			configuredPolicy: undefined,
			hasAnyAccount: true,
		});

		assert.isFalse(policy.isOpen);
	});
});
