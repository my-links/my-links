import type { QueryClientContract } from '@adonisjs/lucid/types/database';
import { DateTime } from 'luxon';

import {
	EXTENSION_TOKEN_LIFETIME_DAYS,
	EXTENSION_TOKEN_MARKER_ABILITY,
} from '#constants/api_token';

const ACCESS_TOKENS_TABLE = 'auth_access_tokens';
const EXTENSION_TOKEN_NAME = 'Browser extension';
const FULL_ACCESS_ABILITIES = ['*'];

const LEGACY_ABILITIES_JSON = JSON.stringify(FULL_ACCESS_ABILITIES);
const MARKED_ABILITIES_JSON = JSON.stringify([
	...FULL_ACCESS_ABILITIES,
	EXTENSION_TOKEN_MARKER_ABILITY,
]);

/**
 * Extension tokens minted before the rolling expiry carry no marker and never
 * expire. Tagging them hands them to the same rolling scheme as new ones.
 *
 * Lives outside `database/migrations/` because that directory is scanned by the
 * migrator: every file in it is executed as a migration.
 */
export async function markLegacyExtensionTokens(
	client: QueryClientContract
): Promise<void> {
	await client
		.from(ACCESS_TOKENS_TABLE)
		.where('name', EXTENSION_TOKEN_NAME)
		.andWhere('abilities', LEGACY_ABILITIES_JSON)
		.whereNull('expires_at')
		.update({
			abilities: MARKED_ABILITIES_JSON,
			expires_at: DateTime.now()
				.plus({ days: EXTENSION_TOKEN_LIFETIME_DAYS })
				.toJSDate(),
		});
}

// Also reverts tokens minted after the rolling expiry shipped: the rollback is lossy by design.
export async function revertLegacyExtensionTokensMarking(
	client: QueryClientContract
): Promise<void> {
	await client
		.from(ACCESS_TOKENS_TABLE)
		.where('name', EXTENSION_TOKEN_NAME)
		.andWhere('abilities', MARKED_ABILITIES_JSON)
		.update({ abilities: LEGACY_ABILITIES_JSON, expires_at: null });
}
