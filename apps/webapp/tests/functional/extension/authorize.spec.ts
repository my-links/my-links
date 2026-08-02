import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import { createUser } from '#tests/factories/user_factory';

const VALID_REDIRECT_URI =
	'https://abcdefghijklmnopabcdefghijklmnop.chromiumapp.org/';

test.group('Extension authorize', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should redirect unauthenticated requests instead of exposing a token', async ({
		client,
		assert,
	}) => {
		const response = await client
			.get('/extension/authorize')
			.qs({ redirect_uri: VALID_REDIRECT_URI })
			.redirects(0);

		assert.equal(response.response.status, 302);
	});

	test('should reject a redirect_uri that is not a chromiumapp.org callback', async ({
		client,
	}) => {
		const user = await createUser();

		const response = await client
			.get('/extension/authorize')
			.qs({ redirect_uri: 'https://evil.example.com/steal' })
			.redirects(0)
			.loginAs(user);

		response.assertStatus(400);
	});

	test('should redirect to the callback with a token in the fragment', async ({
		client,
		assert,
	}) => {
		const user = await createUser();

		const response = await client
			.get('/extension/authorize')
			.qs({ redirect_uri: VALID_REDIRECT_URI })
			.redirects(0)
			.loginAs(user);

		assert.equal(response.response.status, 302);
		const location = response.response.headers.location;
		assert.isTrue(location.startsWith(VALID_REDIRECT_URI));
		assert.match(location, /#token=.+/);
	});
});
