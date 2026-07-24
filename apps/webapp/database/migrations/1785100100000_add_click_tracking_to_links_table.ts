import { BaseSchema } from '@adonisjs/lucid/schema';

export default class AddClickTrackingToLinksTable extends BaseSchema {
	protected tableName = 'links';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.integer('clicks').unsigned().notNullable().defaultTo(0);
			table.timestamp('last_clicked_at').nullable();
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('clicks');
			table.dropColumn('last_clicked_at');
		});
	}
}
