import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import env from '#start/env';
import { createUser } from '#tests/factories/user_factory';
import { nextClientAddress } from '#tests/helpers/client_addresses';
import { freshSudoSession } from '#tests/helpers/sudo_mode';

const FLOOR_MILLISECONDS = 300;
const FLOOR_ENV_KEY = 'ACCOUNT_LOOKUP_MIN_RESPONSE_MS';
const UNKNOWN_EMAIL = 'nobody-at-all@example.com';

async function elapsedMilliseconds(send: () => Promise<unknown>) {
	const startedAt = performance.now();
	await send();

	return performance.now() - startedAt;
}

test.group('Account lookup routes: response time floor', (group) => {
	let previousFloor: number | undefined;

	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(() => {
		previousFloor = env.get(FLOOR_ENV_KEY);
		env.set(FLOOR_ENV_KEY, String(FLOOR_MILLISECONDS));

		return () => env.set(FLOOR_ENV_KEY, String(previousFloor ?? 0));
	});

	test('should pad a sign-up of an unknown address', async ({
		assert,
		client,
	}) => {
		const elapsed = await elapsedMilliseconds(() =>
			client
				.post('/register')
				.header('x-forwarded-for', nextClientAddress())
				.form({ name: 'Ada', email: UNKNOWN_EMAIL })
				.withCsrfToken()
				.redirects(0)
		);

		assert.isAtLeast(elapsed, FLOOR_MILLISECONDS);
	});

	test('should pad a password reset request for an unknown address', async ({
		assert,
		client,
	}) => {
		const elapsed = await elapsedMilliseconds(() =>
			client
				.post('/forgot-password')
				.header('x-forwarded-for', nextClientAddress())
				.form({ email: UNKNOWN_EMAIL })
				.withCsrfToken()
				.redirects(0)
		);

		assert.isAtLeast(elapsed, FLOOR_MILLISECONDS);
	});

	test('should pad a verification resend for an unknown address', async ({
		assert,
		client,
	}) => {
		const elapsed = await elapsedMilliseconds(() =>
			client
				.post('/resend-verification')
				.header('x-forwarded-for', nextClientAddress())
				.form({ email: UNKNOWN_EMAIL })
				.withCsrfToken()
				.redirects(0)
		);

		assert.isAtLeast(elapsed, FLOOR_MILLISECONDS);
	});

	test('should pad an email change request', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'padding-email-change' });

		const elapsed = await elapsedMilliseconds(() =>
			client
				.post('/account/email')
				.header('x-forwarded-for', nextClientAddress())
				.form({ email: UNKNOWN_EMAIL })
				.withCsrfToken()
				.loginAs(user)
				.withSession(freshSudoSession())
				.redirects(0)
		);

		assert.isAtLeast(elapsed, FLOOR_MILLISECONDS);
	});
});
