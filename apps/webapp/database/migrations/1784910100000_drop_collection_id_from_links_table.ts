import { BaseSchema } from '@adonisjs/lucid/schema';

export default class DropCollectionIdFromLinksTable extends BaseSchema {
	protected tableName = 'links';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('collection_id');
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table
				.integer('collection_id')
				.references('id')
				.inTable('collections')
				.onDelete('CASCADE');
		});

		this.schema.raw(`
			UPDATE links
			SET collection_id = (
				SELECT collection_id FROM collection_link
				WHERE collection_link.link_id = links.id
				ORDER BY collection_id ASC
				LIMIT 1
			);
		`);
	}
}
