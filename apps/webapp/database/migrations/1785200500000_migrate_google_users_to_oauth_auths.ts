import { BaseSchema } from '@adonisjs/lucid/schema';

import {
	backfillGoogleOauthAuths,
	revertGoogleOauthAuthsBackfill,
} from '#database/backfills/google_oauth_backfill';

/**
 * Data-only migration, kept separate from the column drop that follows it so an
 * operator can inspect the result in production before the legacy columns
 * become unrecoverable.
 */
export default class extends BaseSchema {
	async up() {
		this.defer(async (client) => {
			await backfillGoogleOauthAuths(client);
		});
	}

	async down() {
		this.defer(async (client) => {
			await revertGoogleOauthAuthsBackfill(client);
		});
	}
}
