import { BaseSchema } from '@adonisjs/lucid/schema';

const LEGACY_PROVIDER_TYPES = ['google'];

/**
 * `users` becomes a pure identity table: the Google identity now lives in
 * `oauth_auths`, and `token` held a plaintext OAuth token that nothing ever
 * read. `avatar_url` turns nullable because a credentials account has no
 * provider to source a picture from.
 */
export default class extends BaseSchema {
	protected tableName = 'users';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('provider_id');
			table.dropColumn('provider_type');
			table.dropColumn('token');
			table.text('avatar_url').nullable().alter();
		});
	}

	async down() {
		this.defer(async (client) => {
			await client
				.from(this.tableName)
				.whereNull('avatar_url')
				.update({ avatar_url: '' });
		});

		this.schema.alterTable(this.tableName, (table) => {
			// Restored nullable: the dropped values are gone, so the original
			// NOT NULL could not be satisfied.
			table.string('provider_id').nullable();
			table.enum('provider_type', LEGACY_PROVIDER_TYPES).nullable();
			table.json('token').nullable();
			table.text('avatar_url').notNullable().alter();
		});
	}
}
