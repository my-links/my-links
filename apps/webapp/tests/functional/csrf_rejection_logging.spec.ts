import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import { nextClientAddress } from '#tests/helpers/client_addresses';
import {
	clearCapturedLogs,
	readCapturedLogs,
} from '#tests/helpers/captured_logs';

const PINO_LEVEL_INFO = 30;
const REJECTED_CSRF_MESSAGE = 'Invalid or expired CSRF token';

function findRejectedCsrfLine() {
	return readCapturedLogs().find((line) => line.msg === REJECTED_CSRF_MESSAGE);
}

test.group('CSRF rejection: logging', (group) => {
	group.each.setup(() => {
		clearCapturedLogs();
		return testUtils.db().wrapInGlobalTransaction();
	});

	test('should log a rejected CSRF token at info level', async ({
		assert,
		client,
	}) => {
		await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: 'someone@example.com', password: 'irrelevant' })
			.redirects(0);

		assert.equal(findRejectedCsrfLine()?.level, PINO_LEVEL_INFO);
	});

	test('should log the request method when a CSRF token is rejected', async ({
		assert,
		client,
	}) => {
		await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: 'someone@example.com', password: 'irrelevant' })
			.redirects(0);

		assert.equal(findRejectedCsrfLine()?.method, 'POST');
	});

	test('should log the request url when a CSRF token is rejected', async ({
		assert,
		client,
	}) => {
		await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: 'someone@example.com', password: 'irrelevant' })
			.redirects(0);

		assert.equal(findRejectedCsrfLine()?.url, '/login');
	});

	test('should report a session cookie when the request carries one', async ({
		assert,
		client,
	}) => {
		await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: 'someone@example.com', password: 'irrelevant' })
			.redirects(0);

		assert.isTrue(findRejectedCsrfLine()?.hasSessionCookie);
	});
});
