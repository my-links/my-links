import testUtils from '@adonisjs/core/services/test_utils';
import db from '@adonisjs/lucid/services/db';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import {
	ONE_TIME_TOKEN_TYPE,
	STALE_TOKEN_RETENTION_DAYS,
} from '#constants/auth';
import OneTimeToken from '#models/one_time_token';
import User from '#models/user';
import { StaleTokenPruneService } from '#services/auth/stale_token_prune_service';
import { createUser } from '#tests/factories/user_factory';

const BEYOND_RETENTION = { days: STALE_TOKEN_RETENTION_DAYS + 1 };
const WITHIN_RETENTION = { hours: 1 };

type OneTimeTokenTiming = {
	readonly expiresAt: DateTime;
	readonly consumedAt: DateTime | null;
};

let tokenCounter = 0;

function createOneTimeToken(user: User, timing: OneTimeTokenTiming) {
	tokenCounter += 1;

	return OneTimeToken.create({
		userId: user.id,
		type: ONE_TIME_TOKEN_TYPE.EMAIL_CHANGE,
		tokenHash: `stale-prune-hash-${Date.now()}-${tokenCounter}`,
		newEmail: 'moving-to@example.com',
		...timing,
	});
}

async function createAccessTokenExpiringAt(user: User, expiresAt: DateTime) {
	const token = await User.accessTokens.create(user, undefined, {
		name: 'Stale prune',
	});
	await db
		.from('auth_access_tokens')
		.where('id', token.identifier as number)
		.update({ expires_at: expiresAt.toJSDate() });

	return token;
}

async function hasAccessToken(identifier: unknown): Promise<boolean> {
	return (
		(await db
			.from('auth_access_tokens')
			.where('id', identifier as number)
			.first()) !== null
	);
}

test.group('StaleTokenPruneService.pruneStale', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should delete a one-time token consumed beyond retention', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'prune-consumed' });
		const token = await createOneTimeToken(user, {
			expiresAt: DateTime.now().plus({ days: 1 }),
			consumedAt: DateTime.now().minus(BEYOND_RETENTION),
		});

		await new StaleTokenPruneService().pruneStale();

		assert.isNull(await OneTimeToken.find(token.id));
	});

	test('should delete a one-time token expired beyond retention', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'prune-expired' });
		const token = await createOneTimeToken(user, {
			expiresAt: DateTime.now().minus(BEYOND_RETENTION),
			consumedAt: null,
		});

		await new StaleTokenPruneService().pruneStale();

		assert.isNull(await OneTimeToken.find(token.id));
	});

	test('should keep a one-time token consumed within retention', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'prune-fresh-consumed' });
		const token = await createOneTimeToken(user, {
			expiresAt: DateTime.now().plus({ days: 1 }),
			consumedAt: DateTime.now().minus(WITHIN_RETENTION),
		});

		await new StaleTokenPruneService().pruneStale();

		assert.isNotNull(await OneTimeToken.find(token.id));
	});

	test('should keep a one-time token that is still usable', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'prune-usable' });
		const token = await createOneTimeToken(user, {
			expiresAt: DateTime.now().plus({ hours: 1 }),
			consumedAt: null,
		});

		await new StaleTokenPruneService().pruneStale();

		assert.isNotNull(await OneTimeToken.find(token.id));
	});

	test('should delete an access token expired beyond retention', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'prune-access-expired' });
		const token = await createAccessTokenExpiringAt(
			user,
			DateTime.now().minus(BEYOND_RETENTION)
		);

		await new StaleTokenPruneService().pruneStale();

		assert.isFalse(await hasAccessToken(token.identifier));
	});

	test('should keep an access token that never expires', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'prune-access-forever' });
		const token = await User.accessTokens.create(user, undefined, {
			name: 'Never expires',
		});

		await new StaleTokenPruneService().pruneStale();

		assert.isTrue(await hasAccessToken(token.identifier));
	});

	test('should keep an access token expired within retention', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'prune-access-recent' });
		const token = await createAccessTokenExpiringAt(
			user,
			DateTime.now().minus(WITHIN_RETENTION)
		);

		await new StaleTokenPruneService().pruneStale();

		assert.isTrue(await hasAccessToken(token.identifier));
	});
});
