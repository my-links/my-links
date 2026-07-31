import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'auth_events';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			// Who did it, when that is somebody other than the account it happened
			// to. Without it an administrator marking an address confirmed is
			// written exactly like its owner confirming it — with the
			// administrator's address and user agent attached to the target
			// account, which is worse than saying nothing.
			//
			// SET NULL for the same reason `user_id` is: the trail outlives both
			// accounts it names.
			table
				.integer('actor_id')
				.unsigned()
				.nullable()
				.references('id')
				.inTable('users')
				.onDelete('SET NULL');

			// The journal is read newest first and nothing else orders it.
			table.index(['created_at']);
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropIndex(['created_at']);
			table.dropColumn('actor_id');
		});
	}
}
