import { BaseSchema } from '@adonisjs/lucid/schema';

import { defaultTableFields } from '#database/default_table_fields';

export default class extends BaseSchema {
	protected tableName = 'one_time_tokens';

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table
				.integer('user_id')
				.unsigned()
				.notNullable()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');
			table.string('type', 32).notNullable();
			// Only the sha256 of a high-entropy token is stored: the digest is
			// indexable for lookups and the plaintext never survives the email
			// it was sent in.
			table.string('token_hash', 64).notNullable().unique();
			table.timestamp('expires_at').notNullable();
			table.timestamp('consumed_at').nullable();

			table.index(['user_id', 'type']);

			defaultTableFields(table);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
