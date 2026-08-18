import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'links';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.string('description', 300).nullable().alter();
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.string('description', 254).nullable().alter();
		});
	}
}
