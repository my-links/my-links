import testUtils from '@adonisjs/core/services/test_utils';
import db from '@adonisjs/lucid/services/db';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import {
	EXTENSION_TOKEN_LIFETIME_DAYS,
	EXTENSION_TOKEN_MARKER_ABILITY,
} from '#constants/api_token';
import {
	markLegacyExtensionTokens,
	revertLegacyExtensionTokensMarking,
} from '#database/backfills/legacy_extension_token_backfill';
import type User from '#models/user';
import { createUser } from '#tests/factories/user_factory';

type TokenRowOverrides = {
	name?: string;
	abilities?: string[];
	expiresAt?: Date | null;
};

async function insertToken(
	user: User,
	{
		name = 'Browser extension',
		abilities = ['*'],
		expiresAt = null,
	}: TokenRowOverrides = {}
): Promise<number> {
	const [row] = await db
		.table('auth_access_tokens')
		.insert({
			tokenable_id: user.id,
			type: 'auth_token',
			name,
			hash: `hash-${Math.random()}`,
			abilities: JSON.stringify(abilities),
			expires_at: expiresAt,
			created_at: new Date(),
			updated_at: new Date(),
		})
		.returning('id');

	return row.id;
}

async function readToken(tokenId: number) {
	return db.from('auth_access_tokens').where('id', tokenId).firstOrFail();
}

test.group('Legacy extension token backfill', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should add the marker ability to a legacy extension token', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'legacy-token' });
		const tokenId = await insertToken(user);

		await markLegacyExtensionTokens(db.connection());

		const row = await readToken(tokenId);
		assert.deepEqual(JSON.parse(row.abilities), [
			'*',
			EXTENSION_TOKEN_MARKER_ABILITY,
		]);
	});

	test('should give a legacy extension token the rolling lifetime', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'legacy-token' });
		const tokenId = await insertToken(user);

		await markLegacyExtensionTokens(db.connection());

		const row = await readToken(tokenId);
		const remainingDays = DateTime.fromJSDate(row.expires_at).diffNow('days');
		assert.closeTo(remainingDays.days, EXTENSION_TOKEN_LIFETIME_DAYS, 0.01);
	});

	test('should leave a token with another name alone', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'legacy-token' });
		const tokenId = await insertToken(user, { name: 'CI script' });

		await markLegacyExtensionTokens(db.connection());

		const row = await readToken(tokenId);
		assert.isNull(row.expires_at);
	});

	test('should leave a legacy-named token with scoped abilities alone', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'legacy-token' });
		const tokenId = await insertToken(user, { abilities: ['links:read'] });

		await markLegacyExtensionTokens(db.connection());

		const row = await readToken(tokenId);
		assert.deepEqual(JSON.parse(row.abilities), ['links:read']);
	});

	test('should keep the expiry of a legacy-named token that already has one', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'legacy-token' });
		const expiresAt = DateTime.now().plus({ days: 5 }).startOf('second');
		const tokenId = await insertToken(user, {
			expiresAt: expiresAt.toJSDate(),
		});

		await markLegacyExtensionTokens(db.connection());

		const row = await readToken(tokenId);
		assert.equal(row.expires_at.getTime(), expiresAt.toMillis());
	});

	test('should restore a marked extension token on revert', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'legacy-token' });
		const tokenId = await insertToken(user);
		await markLegacyExtensionTokens(db.connection());

		await revertLegacyExtensionTokensMarking(db.connection());

		const row = await readToken(tokenId);
		assert.deepEqual(JSON.parse(row.abilities), ['*']);
		assert.isNull(row.expires_at);
	});
});
