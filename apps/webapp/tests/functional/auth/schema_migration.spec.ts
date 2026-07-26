import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import OauthAuth from '#models/oauth_auth';
import { AUTH_PROVIDER } from '#constants/auth';
import { createUser, linkOauthIdentity } from '#tests/factories/user_factory';
import { backfillGoogleOauthAuths } from '#database/backfills/google_oauth_backfill';

const LEGACY_PROVIDER_USER_ID = '109876543210987654321';

/**
 * The legacy columns are gone from the migrated schema, so the backfill is
 * exercised against a temporary re-creation of them. The whole group runs
 * inside a rolled-back transaction, and PostgreSQL is transactional for DDL, so
 * the columns never outlive the test that added them.
 */
async function restoreLegacyProviderColumns() {
	await db.rawQuery(
		`ALTER TABLE users
		 ADD COLUMN provider_id varchar(255),
		 ADD COLUMN provider_type varchar(255)`
	);
}

async function createLegacyGoogleUser(providerUserId: string): Promise<User> {
	const user = await createUser({ emailPrefix: 'legacy-google' });

	await db.rawQuery(
		`UPDATE users
		 SET provider_id = :providerUserId,
		     provider_type = :provider,
		     email_verified_at = NULL
		 WHERE id = :userId`,
		{
			providerUserId,
			provider: AUTH_PROVIDER.GOOGLE,
			userId: user.id,
		}
	);

	return user;
}

test.group('Google users backfill', (group) => {
	group.each.setup(async () => {
		const rollback = await testUtils.db().withGlobalTransaction();
		await restoreLegacyProviderColumns();
		return rollback;
	});

	test('should keep the identity of an existing google user', async ({
		assert,
	}) => {
		const legacyUser = await createLegacyGoogleUser(LEGACY_PROVIDER_USER_ID);

		await backfillGoogleOauthAuths(db.connection());

		const migratedUser = await User.findOrFail(legacyUser.id);
		assert.equal(migratedUser.email, legacyUser.email);
		assert.equal(migratedUser.name, legacyUser.name);
	});

	test('should create an oauth identity carrying the legacy provider user id', async ({
		assert,
	}) => {
		const legacyUser = await createLegacyGoogleUser(LEGACY_PROVIDER_USER_ID);

		await backfillGoogleOauthAuths(db.connection());

		const oauthAuth = await OauthAuth.query()
			.where('userId', legacyUser.id)
			.firstOrFail();
		assert.equal(oauthAuth.provider, AUTH_PROVIDER.GOOGLE);
		assert.equal(oauthAuth.providerUserId, LEGACY_PROVIDER_USER_ID);
	});

	test('should mark an existing google user as email verified', async ({
		assert,
	}) => {
		const legacyUser = await createLegacyGoogleUser(LEGACY_PROVIDER_USER_ID);

		await backfillGoogleOauthAuths(db.connection());

		const migratedUser = await User.findOrFail(legacyUser.id);
		assert.isNotNull(migratedUser.emailVerifiedAt);
	});

	test('should be safe to replay on an already migrated database', async ({
		assert,
	}) => {
		const legacyUser = await createLegacyGoogleUser(LEGACY_PROVIDER_USER_ID);

		await backfillGoogleOauthAuths(db.connection());
		await backfillGoogleOauthAuths(db.connection());

		const oauthAuths = await OauthAuth.query().where('userId', legacyUser.id);
		assert.lengthOf(oauthAuths, 1);
	});
});

test.group('Oauth identity uniqueness', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should reject a provider identity already linked to another account', async ({
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'identity-owner' });
		const impersonator = await createUser({ emailPrefix: 'identity-thief' });
		await linkOauthIdentity(owner, LEGACY_PROVIDER_USER_ID);

		await assert.rejects(() =>
			linkOauthIdentity(impersonator, LEGACY_PROVIDER_USER_ID)
		);
	});

	test('should reject a second identity for the same provider on one account', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'identity-duplicate' });
		await linkOauthIdentity(user, LEGACY_PROVIDER_USER_ID);

		await assert.rejects(() => linkOauthIdentity(user, '2222222222'));
	});
});
