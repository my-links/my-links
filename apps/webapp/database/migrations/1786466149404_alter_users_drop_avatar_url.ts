import { BaseSchema } from '@adonisjs/lucid/schema';

/**
 * The admin UI now shows an initials avatar instead of the OAuth provider's
 * picture, so nothing reads `avatar_url` anymore.
 */
export default class extends BaseSchema {
	protected tableName = 'users';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('avatar_url');
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.text('avatar_url').nullable();
		});
	}
}
