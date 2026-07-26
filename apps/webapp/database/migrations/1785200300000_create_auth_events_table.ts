import { BaseSchema } from '@adonisjs/lucid/schema';

import { defaultTableFields } from '#database/default_table_fields';

export default class extends BaseSchema {
	protected tableName = 'auth_events';

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			// The audit trail outlives the account it describes, hence SET NULL
			// rather than the CASCADE used by the credential tables.
			table
				.integer('user_id')
				.unsigned()
				.nullable()
				.references('id')
				.inTable('users')
				.onDelete('SET NULL');
			table.string('type', 48).notNullable();
			table.string('ip', 45).nullable();
			table.text('user_agent').nullable();

			table.index(['user_id']);

			defaultTableFields(table);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
