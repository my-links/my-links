import { BaseSchema } from '@adonisjs/lucid/schema';

import { defaultTableFields } from '#database/default_table_fields';

export default class extends BaseSchema {
	protected tableName = 'favicon_failures';

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.string('origin', 254).notNullable().unique();
			table.text('reason').notNullable();
			table.timestamp('failed_at').notNullable();
			table.integer('attempts').unsigned().notNullable().defaultTo(1);

			defaultTableFields(table);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
