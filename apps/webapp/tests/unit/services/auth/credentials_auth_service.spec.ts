import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import type User from '#models/user';
import { PasswordHasher } from '#services/auth/password_hasher';
import { createUser, setUserPassword } from '#tests/factories/user_factory';
import { CredentialsAuthService } from '#services/auth/credentials_auth_service';

const VALID_PASSWORD = 'correct-horse-battery-staple';
const WRONG_PASSWORD = 'wrong-horse-battery-staple';
const UNKNOWN_EMAIL = 'nobody@example.com';

/**
 * Counts verifications so a spec can assert the timing guarantee — every
 * failure path pays for one hash comparison — without measuring durations.
 */
class CountingPasswordHasher extends PasswordHasher {
	verifyCallsCount = 0;

	override verify(
		hashedPassword: string,
		plainPassword: string
	): Promise<boolean> {
		this.verifyCallsCount += 1;
		return super.verify(hashedPassword, plainPassword);
	}
}

async function createUserWithPassword(): Promise<User> {
	const user = await createUser({ emailPrefix: 'credentials' });
	await setUserPassword(user, VALID_PASSWORD);
	return user;
}

test.group('CredentialsAuthService', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should return the account when the email and password match', async ({
		assert,
	}) => {
		const user = await createUserWithPassword();
		const service = new CredentialsAuthService(new PasswordHasher());

		const authenticatedUser = await service.verifyCredentials(
			user.email,
			VALID_PASSWORD
		);

		assert.equal(authenticatedUser.id, user.id);
	});

	test('should reject the attempt when the password does not match', async ({
		assert,
	}) => {
		const user = await createUserWithPassword();
		const service = new CredentialsAuthService(new PasswordHasher());

		await assert.rejects(
			() => service.verifyCredentials(user.email, WRONG_PASSWORD),
			'Invalid user credentials'
		);
	});

	test('should reject the attempt when no account matches the email', async ({
		assert,
	}) => {
		const service = new CredentialsAuthService(new PasswordHasher());

		await assert.rejects(
			() => service.verifyCredentials(UNKNOWN_EMAIL, VALID_PASSWORD),
			'Invalid user credentials'
		);
	});

	test('should reject the attempt when the account has no password', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'passwordless' });
		const service = new CredentialsAuthService(new PasswordHasher());

		await assert.rejects(
			() => service.verifyCredentials(user.email, VALID_PASSWORD),
			'Invalid user credentials'
		);
	});

	test('should still run a hash verification when no account matches the email', async ({
		assert,
	}) => {
		const passwordHasher = new CountingPasswordHasher();
		const service = new CredentialsAuthService(passwordHasher);

		await assert.rejects(() =>
			service.verifyCredentials(UNKNOWN_EMAIL, VALID_PASSWORD)
		);

		assert.equal(passwordHasher.verifyCallsCount, 1);
	});

	test('should still run a hash verification when the account has no password', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'passwordless' });
		const passwordHasher = new CountingPasswordHasher();
		const service = new CredentialsAuthService(passwordHasher);

		await assert.rejects(() =>
			service.verifyCredentials(user.email, VALID_PASSWORD)
		);

		assert.equal(passwordHasher.verifyCallsCount, 1);
	});
});
