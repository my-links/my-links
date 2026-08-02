import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'audit_events';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.string('type', 64).notNullable().alter();

			// null means an authentication event — the vocabulary this table
			// carried before activity rows existed.
			table.string('subject_type', 24).nullable();

			// No foreign key: links and collections are hard-deleted and the
			// journal has to outlive them, same reasoning as `sync_deletions`.
			table.integer('subject_id').nullable();

			table.jsonb('metadata').nullable();

			table.index(['subject_type']);
			table.index(['subject_type', 'created_at']);
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropIndex(['subject_type', 'created_at']);
			table.dropIndex(['subject_type']);
			table.dropColumn('metadata');
			table.dropColumn('subject_id');
			table.dropColumn('subject_type');
			table.string('type', 48).notNullable().alter();
		});
	}
}
