import { defaultTableFields } from '#database/default_table_fields';
import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateApiTokensTable extends BaseSchema {
	static tableName = 'api_tokens';

	async up() {
		const exists = await this.schema.hasTable(CreateApiTokensTable.tableName);
		if (exists) {
			return console.warn(
				`Table ${CreateApiTokensTable.tableName} already exists.`
			);
		}

		this.schema.createTable(CreateApiTokensTable.tableName, (table) => {
			table
				.integer('user_id')
				.unsigned()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');
			table.string('name', 255).notNullable();
			table.string('token', 255).notNullable().unique();
			table.timestamp('last_used_at').nullable();
			table.timestamp('expires_at').nullable();
			table.boolean('is_active').defaultTo(true).notNullable();

			defaultTableFields(table);
		});
	}

	async down() {
		this.schema.dropTable(CreateApiTokensTable.tableName);
	}
}
