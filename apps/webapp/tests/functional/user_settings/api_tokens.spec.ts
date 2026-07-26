import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import { createUser } from '#tests/factories/user_factory';

const TOKENS_ROUTE = '/user/api-tokens';
const UNKNOWN_TOKEN_ID = '999999';
const TOKEN_NOT_FOUND_MESSAGE = 'This API token no longer exists';

test.group('API tokens — revocation', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should revoke a token the account owns', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'token-owner' });
		const token = await User.accessTokens.create(user, undefined, {
			name: 'Browser extension',
		});

		await client
			.delete(`${TOKENS_ROUTE}/${String(token.identifier)}`)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const remainingTokens = await User.accessTokens.all(user);
		assert.isEmpty(remainingTokens);
	});

	test('should leave a token belonging to another account untouched', async ({
		assert,
		client,
	}) => {
		const owner = await createUser({ emailPrefix: 'token-owner' });
		const intruder = await createUser({ emailPrefix: 'token-intruder' });
		const token = await User.accessTokens.create(owner, undefined, {
			name: 'Browser extension',
		});

		await client
			.delete(`${TOKENS_ROUTE}/${String(token.identifier)}`)
			.withCsrfToken()
			.loginAs(intruder)
			.redirects(0);

		const ownerTokens = await User.accessTokens.all(owner);
		assert.lengthOf(ownerTokens, 1);
	});

	test('should tell the user when the token no longer exists', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'token-missing' });

		const response = await client
			.delete(`${TOKENS_ROUTE}/${UNKNOWN_TOKEN_ID}`)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertFlashMessage('error', TOKEN_NOT_FOUND_MESSAGE);
	});
});
