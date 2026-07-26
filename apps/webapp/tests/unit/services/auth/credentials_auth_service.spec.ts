import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import type User from '#models/user';
import AuthEvent from '#models/auth_event';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { PasswordHasher } from '#services/auth/password_hasher';
import { AuthEventService } from '#services/auth/auth_event_service';
import type { AuthEventOrigin } from '#services/auth/auth_event_service';
import { createUser, setUserPassword } from '#tests/factories/user_factory';
import { CredentialsAuthService } from '#services/auth/credentials_auth_service';

const VALID_PASSWORD = 'correct-horse-battery-staple';
const WRONG_PASSWORD = 'wrong-horse-battery-staple';
const UNKNOWN_EMAIL = 'nobody@example.com';
const GENERIC_FAILURE_MESSAGE = 'Invalid email address or password';
const ORIGIN: AuthEventOrigin = { ip: '203.0.113.1', userAgent: 'japa' };

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

function buildService(
	passwordHasher: PasswordHasher = new PasswordHasher()
): CredentialsAuthService {
	return new CredentialsAuthService(passwordHasher, new AuthEventService());
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
		const service = buildService();

		const authenticatedUser = await service.verifyCredentials({
			email: user.email,
			password: VALID_PASSWORD,
			origin: ORIGIN,
		});

		assert.equal(authenticatedUser.id, user.id);
	});

	test('should reject the attempt when the password does not match', async ({
		assert,
	}) => {
		const user = await createUserWithPassword();
		const service = buildService();

		await assert.rejects(
			() =>
				service.verifyCredentials({
					email: user.email,
					password: WRONG_PASSWORD,
					origin: ORIGIN,
				}),
			GENERIC_FAILURE_MESSAGE
		);
	});

	test('should reject the attempt when no account matches the email', async ({
		assert,
	}) => {
		const service = buildService();

		await assert.rejects(
			() =>
				service.verifyCredentials({
					email: UNKNOWN_EMAIL,
					password: VALID_PASSWORD,
					origin: ORIGIN,
				}),
			GENERIC_FAILURE_MESSAGE
		);
	});

	test('should reject the attempt when the account has no password', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'passwordless' });
		const service = buildService();

		await assert.rejects(
			() =>
				service.verifyCredentials({
					email: user.email,
					password: VALID_PASSWORD,
					origin: ORIGIN,
				}),
			GENERIC_FAILURE_MESSAGE
		);
	});

	test('should still run a hash verification when no account matches the email', async ({
		assert,
	}) => {
		const passwordHasher = new CountingPasswordHasher();
		const service = buildService(passwordHasher);

		await assert.rejects(() =>
			service.verifyCredentials({
				email: UNKNOWN_EMAIL,
				password: VALID_PASSWORD,
				origin: ORIGIN,
			})
		);

		assert.equal(passwordHasher.verifyCallsCount, 1);
	});

	test('should still run a hash verification when the account has no password', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'passwordless' });
		const passwordHasher = new CountingPasswordHasher();
		const service = buildService(passwordHasher);

		await assert.rejects(() =>
			service.verifyCredentials({
				email: user.email,
				password: VALID_PASSWORD,
				origin: ORIGIN,
			})
		);

		assert.equal(passwordHasher.verifyCallsCount, 1);
	});

	test('should journal the failed attempt against the account it targeted', async ({
		assert,
	}) => {
		const user = await createUserWithPassword();
		const service = buildService();

		await assert.rejects(() =>
			service.verifyCredentials({
				email: user.email,
				password: WRONG_PASSWORD,
				origin: ORIGIN,
			})
		);

		const event = await AuthEvent.query()
			.where('userId', user.id)
			.orderBy('id', 'desc')
			.firstOrFail();
		assert.equal(event.type, AUTH_EVENT_TYPE.LOGIN_FAILED);
	});
});
