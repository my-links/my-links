import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateCollectionLinkTable extends BaseSchema {
	protected tableName = 'collection_link';

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
				.integer('link_id')
				.unsigned()
				.notNullable()
				.references('id')
				.inTable('links')
				.onDelete('CASCADE');

			table.primary(['collection_id', 'link_id']);
			table.timestamp('created_at').notNullable();
		});

		this.schema.raw(`
			INSERT INTO collection_link (collection_id, link_id, created_at)
			SELECT collection_id, id, created_at FROM links
			WHERE collection_id IS NOT NULL;
		`);
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
