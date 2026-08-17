import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'favicon_entries';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.text('resolved_url').nullable();
			table.timestamp('resolved_at').nullable();
			table.string('etag', 255).nullable();
			table.string('last_modified', 255).nullable();
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('resolved_url');
			table.dropColumn('resolved_at');
			table.dropColumn('etag');
			table.dropColumn('last_modified');
		});
	}
}
