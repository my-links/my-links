import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'collections';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.boolean('is_default').notNullable().defaultTo(false);
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('is_default');
		});
	}
}
