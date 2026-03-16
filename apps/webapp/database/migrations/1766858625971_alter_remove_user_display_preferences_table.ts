import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'users';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('display_preferences');
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.jsonb('display_preferences').defaultTo('{}');
		});
	}
}
