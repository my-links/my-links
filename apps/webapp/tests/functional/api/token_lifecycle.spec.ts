import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';
import type { AccessToken } from '@adonisjs/auth/access_tokens';

import User from '#models/user';
import { createUser } from '#tests/factories/user_factory';
import { ApiTokenService } from '#services/user/api_token_service';
import { API_TOKEN_SCOPE, TOKEN_ABILITY } from '#constants/api_token';

const HTTP_UNAUTHORIZED = 401;
const HTTP_NO_CONTENT = 204;
const HTTP_FORBIDDEN = 403;
const HTTP_OK = 200;
const SECONDS_PER_DAY = 24 * 3600;
/** The timestamp column is zone-less, so a DST change shifts a read by a couple of hours. */
const DAYS_TOLERANCE_SECONDS = SECONDS_PER_DAY / 2;
const EXTENSION_LIFETIME_DAYS = 90;
const TOKENS_ROUTE = '/user/api-tokens';
const CHECK_ROUTE = '/api/v1/tokens/check';
const CURRENT_TOKEN_ROUTE = '/api/v1/tokens/current';

type TokenIdentifier = AccessToken['identifier'];

const apiTokenService = new ApiTokenService();

async function readExpiresAt(tokenId: TokenIdentifier) {
	const row = await db
		.from('auth_access_tokens')
		.where('id', Number(tokenId))
		.firstOrFail();
	return row.expires_at === null ? null : DateTime.fromJSDate(row.expires_at);
}

async function setExpiresAt(tokenId: TokenIdentifier, value: DateTime) {
	await db
		.from('auth_access_tokens')
		.where('id', Number(tokenId))
		.update({ expires_at: value.toJSDate() });
}

function secondsFromNow(moment: DateTime | null): number {
	return Math.abs(moment!.diffNow('seconds').seconds);
}

test.group('Extension token: expiry', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should expire about 90 days after it is minted', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'ext-expiry' });

		const token = await apiTokenService.createExtensionToken(user);

		const expiresAt = await readExpiresAt(token.identifier);
		assert.closeTo(
			secondsFromNow(expiresAt),
			EXTENSION_LIFETIME_DAYS * 24 * 3600,
			DAYS_TOLERANCE_SECONDS
		);
	});

	test('should not be renewed while less than a day of its lifetime has elapsed', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'ext-no-renew' });
		const token = await apiTokenService.createExtensionToken(user);
		await setExpiresAt(
			token.identifier,
			DateTime.now().plus({ days: 89, hours: 12 })
		);
		const before = await readExpiresAt(token.identifier);

		await client
			.get(CHECK_ROUTE)
			.header('Authorization', `Bearer ${token.value!.release()}`);

		const after = await readExpiresAt(token.identifier);
		assert.equal(after!.toMillis(), before!.toMillis());
	});

	test('should be renewed to 90 days once more than a day of its lifetime has elapsed', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'ext-renew' });
		const token = await apiTokenService.createExtensionToken(user);
		await setExpiresAt(token.identifier, DateTime.now().plus({ days: 30 }));

		await client
			.get(CHECK_ROUTE)
			.header('Authorization', `Bearer ${token.value!.release()}`);

		const expiresAt = await readExpiresAt(token.identifier);
		assert.closeTo(
			secondsFromNow(expiresAt),
			EXTENSION_LIFETIME_DAYS * 24 * 3600,
			DAYS_TOLERANCE_SECONDS
		);
	});

	test('should be rejected once expired', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'ext-expired' });
		const token = await apiTokenService.createExtensionToken(user);
		await setExpiresAt(token.identifier, DateTime.now().minus({ minutes: 1 }));

		const response = await client
			.get(CHECK_ROUTE)
			.header('Authorization', `Bearer ${token.value!.release()}`);

		response.assertStatus(HTTP_UNAUTHORIZED);
	});

	test('should not be renewed when the token is a manual one', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'manual-no-renew' });
		const token = await apiTokenService.createToken(user, {
			name: 'Browser extension',
			expiresAt: DateTime.now().plus({ days: 10 }).toJSDate(),
		});
		const before = await readExpiresAt(token.identifier);

		await client
			.get(CHECK_ROUTE)
			.header('Authorization', `Bearer ${token.value!.release()}`);

		const after = await readExpiresAt(token.identifier);
		assert.equal(after!.toMillis(), before!.toMillis());
	});
});

test.group('Manual API token: expiry', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should expire after 90 days when no expiry is chosen', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'manual-default' });

		await client
			.post(TOKENS_ROUTE)
			.form({ name: 'CI', scope: API_TOKEN_SCOPE.FULL_ACCESS })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const [token] = await User.accessTokens.all(user);
		assert.closeTo(
			secondsFromNow(DateTime.fromJSDate(token.expiresAt!)),
			EXTENSION_LIFETIME_DAYS * 24 * 3600,
			DAYS_TOLERANCE_SECONDS
		);
	});

	test('should expire after the chosen number of days', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'manual-30' });

		await client
			.post(TOKENS_ROUTE)
			.form({ name: 'CI', expiry: '30_days' })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const [token] = await User.accessTokens.all(user);
		assert.closeTo(
			secondsFromNow(DateTime.fromJSDate(token.expiresAt!)),
			30 * 24 * 3600,
			DAYS_TOLERANCE_SECONDS
		);
	});

	test('should never expire when "never" is chosen', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'manual-never' });

		await client
			.post(TOKENS_ROUTE)
			.form({ name: 'CI', expiry: 'never' })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const [token] = await User.accessTokens.all(user);
		assert.isNull(token.expiresAt);
	});

	test('should refuse an unknown expiry choice', async ({ client, assert }) => {
		const user = await createUser({ emailPrefix: 'manual-bad-expiry' });

		await client
			.post(TOKENS_ROUTE)
			.fields({ name: 'CI', expiry: 'forever' })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		assert.isEmpty(await User.accessTokens.all(user));
	});
});

test.group('DELETE /api/v1/tokens/current', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 204 and revoke the calling token', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'revoke-self' });
		const token = await apiTokenService.createExtensionToken(user);

		const response = await client
			.delete(CURRENT_TOKEN_ROUTE)
			.header('Authorization', `Bearer ${token.value!.release()}`);

		response.assertStatus(HTTP_NO_CONTENT);
		assert.isEmpty(await User.accessTokens.all(user));
	});

	test('should leave the other tokens of the user valid', async ({
		client,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'revoke-only-self' });
		const callingToken = await apiTokenService.createExtensionToken(user);
		const otherToken = await apiTokenService.createExtensionToken(user);

		await client
			.delete(CURRENT_TOKEN_ROUTE)
			.header('Authorization', `Bearer ${callingToken.value!.release()}`);

		const remainingTokens = await User.accessTokens.all(user);
		assert.deepEqual(
			remainingTokens.map((token) => token.identifier),
			[otherToken.identifier]
		);
	});

	test('should work with a read-only token', async ({ client, assert }) => {
		const user = await createUser({ emailPrefix: 'revoke-read-only' });
		const token = await apiTokenService.createToken(user, {
			name: 'Read only',
			scope: API_TOKEN_SCOPE.READ_ONLY,
		});

		const response = await client
			.delete(CURRENT_TOKEN_ROUTE)
			.header('Authorization', `Bearer ${token.value!.release()}`);

		response.assertStatus(HTTP_NO_CONTENT);
		assert.isEmpty(await User.accessTokens.all(user));
	});

	test('should still refuse a read-only token on other write routes', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'read-only-still-blocked' });

		const response = await client
			.delete('/api/v1/links/1')
			.withGuard('api')
			.loginAs(user, [TOKEN_ABILITY.READ]);

		response.assertStatus(HTTP_FORBIDDEN);
	});

	test('should answer 401 without a token', async ({ client }) => {
		const response = await client.delete(CURRENT_TOKEN_ROUTE);

		response.assertStatus(HTTP_UNAUTHORIZED);
	});

	test('should leave the check route working for a valid token', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'check-ok' });
		const token = await apiTokenService.createExtensionToken(user);

		const response = await client
			.get(CHECK_ROUTE)
			.header('Authorization', `Bearer ${token.value!.release()}`);

		response.assertStatus(HTTP_OK);
	});
});
