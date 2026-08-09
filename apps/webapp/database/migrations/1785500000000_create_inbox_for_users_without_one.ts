import { BaseSchema } from '@adonisjs/lucid/schema';

import {
	backfillMissingInboxCollections,
	revertMissingInboxCollectionsBackfill,
} from '#database/backfills/inbox_backfill';

/**
 * Data-only migration: registration now opens an Inbox with the account, this
 * catches up the accounts that predate it.
 */
export default class extends BaseSchema {
	async up() {
		this.defer(async (client) => {
			await backfillMissingInboxCollections(client);
		});
	}

	async down() {
		this.defer(async (client) => {
			await revertMissingInboxCollectionsBackfill(client);
		});
	}
}
