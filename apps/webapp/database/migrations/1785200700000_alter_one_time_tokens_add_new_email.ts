import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'one_time_tokens';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			// The address an email change moves the account to. It lives on the
			// token rather than on `users` on purpose: an account in the middle of
			// a change is indistinguishable from one that never asked for it, so
			// nothing has to be cleaned up when a link is left to expire.
			//
			// Null for every other token type, which carries no address of its own.
			table.string('new_email', 255).nullable();
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('new_email');
		});
	}
}
