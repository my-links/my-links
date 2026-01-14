import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateCollectionFollowersTable extends BaseSchema {
	protected tableName = 'collection_followers';

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table
				.integer('collection_id')
				.unsigned()
				.notNullable()
				.references('id')
				.inTable('collections')
				.onDelete('CASCADE');
			table
				.integer('user_id')
				.unsigned()
				.notNullable()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');

			table.primary(['collection_id', 'user_id']);
			table.timestamp('created_at').notNullable();
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
