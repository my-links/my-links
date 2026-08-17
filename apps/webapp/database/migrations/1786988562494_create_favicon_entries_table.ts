import { BaseSchema } from '@adonisjs/lucid/schema';

import { defaultTableFields } from '#database/default_table_fields';

export default class extends BaseSchema {
	protected tableName = 'favicon_entries';

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			// protocol//hostname — see normalizeFaviconOrigin.
			table.string('origin', 254).notNullable().unique();
			table.string('content_hash', 64).notNullable();
			table.string('content_type', 100).notNullable();
			table.integer('byte_size').unsigned().notNullable();
			// Only 'scraped' today; 'provider:<name>', 'monogram', 'custom' come in later phases.
			table.string('source', 32).notNullable().defaultTo('scraped');

			table.index(['content_hash']);

			defaultTableFields(table);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
