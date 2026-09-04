import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import { createUser } from '#tests/factories/user_factory';

const TOKENS_ROUTE = '/user/api-tokens';

test.group('API token creation — scope', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should persist a read-only token as the "read" ability', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'token-scope-read' });

		await client
			.post(TOKENS_ROUTE)
			.json({ name: 'Read-only token', scope: 'read_only' })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const [token] = await User.accessTokens.all(user);
		assert.deepEqual(token.abilities, ['read']);
	});

	test('should persist a full-access token as the wildcard ability', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'token-scope-full' });

		await client
			.post(TOKENS_ROUTE)
			.json({ name: 'Full access token', scope: 'full_access' })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const [token] = await User.accessTokens.all(user);
		assert.deepEqual(token.abilities, ['*']);
	});

	test('should default to full access when no scope is submitted', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'token-scope-default' });

		await client
			.post(TOKENS_ROUTE)
			.json({ name: 'Legacy client token' })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const [token] = await User.accessTokens.all(user);
		assert.deepEqual(token.abilities, ['*']);
	});
});
