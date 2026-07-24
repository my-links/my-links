import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateSyncDeletionsTable extends BaseSchema {
	protected tableName = 'sync_deletions';

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id').primary();
			table
				.integer('author_id')
				.unsigned()
				.notNullable()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');
			table.string('entity_type', 16).notNullable();
			table.integer('entity_id').unsigned().notNullable();
			table.timestamp('deleted_at').notNullable();

			table.index(['author_id', 'deleted_at']);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
