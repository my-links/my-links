import { BaseSchema } from '@adonisjs/lucid/schema';

import {
	markLegacyExtensionTokens,
	revertLegacyExtensionTokensMarking,
} from '#database/backfills/legacy_extension_token_backfill';

export default class extends BaseSchema {
	async up() {
		this.defer(async (client) => {
			await markLegacyExtensionTokens(client);
		});
	}

	async down() {
		this.defer(async (client) => {
			await revertLegacyExtensionTokensMarking(client);
		});
	}
}
