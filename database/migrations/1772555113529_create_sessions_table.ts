import { BaseSchema } from '@adonisjs/lucid/schema';

export default class UserSessionsTable extends BaseSchema {
	protected tableName = 'user_sessions';

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid('id').primary();
			table.text('data').notNullable();
			table.string('user_id').index();
			table.timestamp('created_at').notNullable().defaultTo(this.now());
			table.timestamp('expires_at').notNullable().index();
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
