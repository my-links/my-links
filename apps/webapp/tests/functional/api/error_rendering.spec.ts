import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import { createUser } from '#tests/factories/user_factory';

const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;
const HTTP_UNPROCESSABLE_ENTITY = 422;
const MISSING_COLLECTION_ID = 999999;

test.group('API error rendering', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should answer an unauthenticated call with its own status rather than a catch-all', async ({
		client,
	}) => {
		const response = await client.get('/api/v1/collections');

		response.assertStatus(HTTP_UNAUTHORIZED);
	});

	test('should answer a missing row with a 404 instead of redirecting the caller', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'api-error' });

		const response = await client
			.get(`/api/v1/collections/${MISSING_COLLECTION_ID}`)
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(HTTP_NOT_FOUND);
	});

	test('should answer invalid input with the field level messages', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'api-error' });

		const response = await client
			.post('/api/v1/links')
			.json({ name: '', url: 'https://example.com', favorite: false })
			.withGuard('api')
			.loginAs(user);

		response.assertStatus(HTTP_UNPROCESSABLE_ENTITY);
		response.assertBodyContains({ errors: [{ field: 'name' }] });
	});
});
