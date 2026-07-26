import { BaseSchema } from '@adonisjs/lucid/schema';

import { defaultTableFields } from '#database/default_table_fields';

export default class extends BaseSchema {
	protected tableName = 'oauth_auths';

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table
				.integer('user_id')
				.unsigned()
				.notNullable()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');
			table.string('provider', 32).notNullable();
			table.string('provider_user_id', 255).notNullable();
			table.timestamp('linked_at').notNullable();

			// A provider identity belongs to exactly one account, and an
			// account holds at most one identity per provider.
			table.unique(['provider', 'provider_user_id']);
			table.unique(['user_id', 'provider']);

			defaultTableFields(table);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
