import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import { nextClientAddress } from '#tests/helpers/client_addresses';
import { createUser, setUserPassword } from '#tests/factories/user_factory';
import {
	clearCapturedLogs,
	readAlwaysOnLogs,
} from '#tests/helpers/captured_logs';

const VALID_PASSWORD = 'correct-horse-battery-staple';

test.group('Login: logging', (group) => {
	group.each.setup(() => {
		clearCapturedLogs();
		return testUtils.db().wrapInGlobalTransaction();
	});

	test('should keep the email out of info and warn logs when a password login succeeds', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'login-logging' });
		await setUserPassword(user, VALID_PASSWORD);

		await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		assert.notInclude(JSON.stringify(readAlwaysOnLogs()), user.email);
	});

	test('should log the user id when a password login succeeds', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'login-logging' });
		await setUserPassword(user, VALID_PASSWORD);

		await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		const successLine = readAlwaysOnLogs().find(
			(line) => line.msg === 'auth success'
		);
		assert.equal(successLine?.userId, user.id);
	});
});
