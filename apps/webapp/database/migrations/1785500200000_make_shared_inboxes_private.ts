import { BaseSchema } from '@adonisjs/lucid/schema';

import { makeInboxesPrivate } from '#database/backfills/inbox_backfill';

/**
 * Data-only migration: `updateCollection` now refuses to share an Inbox, this
 * closes the ones an instance shared while it still could.
 *
 * There is no way down. Reverting would mean republishing a collection its
 * owner is not choosing to publish, and the rows saying which ones were shared
 * are exactly what this deletes.
 */
export default class extends BaseSchema {
	async up() {
		this.defer(async (client) => {
			await makeInboxesPrivate(client);
		});
	}

	async down() {}
}
