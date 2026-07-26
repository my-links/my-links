import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'users';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.timestamp('email_verified_at').nullable();
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('email_verified_at');
		});
	}
}
