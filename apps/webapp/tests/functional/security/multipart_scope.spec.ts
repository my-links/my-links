import router from '@adonisjs/core/services/router';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import bodyParserConfig from '#config/bodyparser';
import {
	DATA_IMPORT_ROUTE_PATTERN,
	MAXIMUM_IMPORT_FILE_SIZE,
} from '#constants/data_import';
import {
	createUser,
	setUserPassword,
	verifyUserEmail,
} from '#tests/factories/user_factory';
import { nextClientAddress } from '#tests/helpers/client_addresses';

const VALID_PASSWORD = 'correct-horse-battery-staple';
const SESSION_GUARD_KEY = 'auth_web';

test.group('Multipart scope: configuration', () => {
	test('should only auto-process multipart bodies on the import route', ({
		assert,
	}) => {
		assert.deepEqual(bodyParserConfig.multipart.autoProcess, [
			DATA_IMPORT_ROUTE_PATTERN,
		]);
	});

	test('should cap multipart bodies at the import file size', ({ assert }) => {
		assert.equal(bodyParserConfig.multipart.limit, MAXIMUM_IMPORT_FILE_SIZE);
	});

	test('should point at a route that exists', ({ assert }) => {
		const registeredPatterns = router
			.toJSON()
			.root.map((route) => route.pattern);

		assert.include(registeredPatterns, DATA_IMPORT_ROUTE_PATTERN);
	});
});

test.group('Multipart scope: other routes', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should not parse a multipart login body', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'multipart-login' });
		await verifyUserEmail(user);
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.field('email', user.email)
			.field('password', VALID_PASSWORD)
			.file('upload', Buffer.from('not wanted'), { filename: 'upload.txt' })
			.withCsrfToken()
			.redirects(0);

		assert.isUndefined(response.session(SESSION_GUARD_KEY));
	});

	test('should still parse a regular form login body', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'form-login' });
		await verifyUserEmail(user);
		await setUserPassword(user, VALID_PASSWORD);

		const response = await client
			.post('/login')
			.header('x-forwarded-for', nextClientAddress())
			.form({ email: user.email, password: VALID_PASSWORD })
			.withCsrfToken()
			.redirects(0);

		response.assertSession(SESSION_GUARD_KEY, user.id);
	});
});
