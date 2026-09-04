import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import { TOKEN_ABILITY } from '#constants/api_token';
import { createUser } from '#tests/factories/user_factory';

const HTTP_OK = 200;
const HTTP_FORBIDDEN = 403;

test.group('API token abilities — REST', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('a read-only token can reach a GET endpoint', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'token-ability-read-get' });

		const response = await client
			.get('/api/v1/collections')
			.withGuard('api')
			.loginAs(user, [TOKEN_ABILITY.READ]);

		response.assertStatus(HTTP_OK);
	});

	test('a read-only token is refused on a write endpoint', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'token-ability-read-write' });

		const response = await client
			.post('/api/v1/links')
			.json({
				name: 'Blocked link',
				url: 'https://example.com',
				favorite: false,
			})
			.withGuard('api')
			.loginAs(user, [TOKEN_ABILITY.READ]);

		response.assertStatus(HTTP_FORBIDDEN);
	});

	test('a full-access token can reach both read and write endpoints', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'token-ability-full' });

		const readResponse = await client
			.get('/api/v1/collections')
			.withGuard('api')
			.loginAs(user, ['*']);
		readResponse.assertStatus(HTTP_OK);

		const writeResponse = await client
			.post('/api/v1/links')
			.json({
				name: 'Allowed link',
				url: 'https://example.com',
				favorite: false,
			})
			.withGuard('api')
			.loginAs(user, ['*']);
		writeResponse.assertStatus(HTTP_OK);
	});
});
