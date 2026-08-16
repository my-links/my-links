import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'users';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			// null means self-service; set means which administrator requested it.
			// Doubles as the login gate's discriminator: only a self-requested
			// deletion is something its own owner can undo by logging back in.
			//
			// SET NULL for the same reason `auth_events.actor_id` is: the trail
			// outlives both accounts it names.
			table
				.integer('pending_deletion_requested_by_id')
				.unsigned()
				.nullable()
				.references('id')
				.inTable('users')
				.onDelete('SET NULL');
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('pending_deletion_requested_by_id');
		});
	}
}
