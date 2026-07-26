import { BaseSchema } from '@adonisjs/lucid/schema';

import { defaultTableFields } from '#database/default_table_fields';

export default class extends BaseSchema {
	protected tableName = 'password_auths';

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table
				.integer('user_id')
				.unsigned()
				.notNullable()
				.unique()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');
			table.string('password', 255).notNullable();
			table.timestamp('password_changed_at').nullable();

			defaultTableFields(table);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
