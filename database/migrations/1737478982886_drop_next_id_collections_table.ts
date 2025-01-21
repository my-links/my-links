import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'collections';

	async up() {
		this.schema.alterTable('collections', (table) => {
			table.dropColumn('next_id');
		});
	}

	async down() {
		this.schema.alterTable('collections', (table) => {
			table
				.integer('next_id')
				.references('id')
				.inTable('collections')
				.defaultTo(null);
		});
	}
}
