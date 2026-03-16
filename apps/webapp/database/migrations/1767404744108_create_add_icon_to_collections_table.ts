import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'collections';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.string('icon', 10).nullable();
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('icon');
		});
	}
}
