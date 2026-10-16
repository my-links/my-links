import { BaseSchema } from '@adonisjs/lucid/schema';

export default class AlterUserSessionsAddPublicId extends BaseSchema {
	protected tableName = 'user_sessions';

	// The session store inserts rows without knowing this column, and the default also fills every existing row.
	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table
				.uuid('public_id')
				.notNullable()
				.unique()
				.defaultTo(this.raw('gen_random_uuid()'));
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('public_id');
		});
	}
}
