import type { QueryClientContract } from '@adonisjs/lucid/types/database';

import { AUTH_PROVIDER } from '#constants/auth';

/**
 * Moves the legacy Google identity carried by `users.provider_id` into the
 * `oauth_auths` table, then marks every pre-existing account as verified:
 * before this migration Google was the only way in, and Google only hands over
 * an account whose email it has verified itself.
 *
 * Lives outside `database/migrations/` because that directory is scanned by the
 * migrator — every file in it is executed as a migration.
 */
export async function backfillGoogleOauthAuths(
	client: QueryClientContract
): Promise<void> {
	await client.rawQuery(
		`INSERT INTO oauth_auths (user_id, provider, provider_user_id, linked_at, created_at, updated_at)
		 SELECT id, :provider, provider_id, created_at, NOW(), NOW()
		 FROM users
		 WHERE provider_id IS NOT NULL
		 ON CONFLICT DO NOTHING`,
		{ provider: AUTH_PROVIDER.GOOGLE }
	);

	await client.rawQuery(
		`UPDATE users SET email_verified_at = created_at WHERE email_verified_at IS NULL`
	);
}

export async function revertGoogleOauthAuthsBackfill(
	client: QueryClientContract
): Promise<void> {
	await client
		.from('oauth_auths')
		.where('provider', AUTH_PROVIDER.GOOGLE)
		.delete();

	await client.from('users').update({ email_verified_at: null });
}
