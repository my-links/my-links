import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'collection_followers';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.integer('position').notNullable().defaultTo(0);
			table.index(['user_id', 'position']);
		});

		this.schema.raw(`
			UPDATE collection_followers AS target
			SET position = ordered.rank
			FROM (
				SELECT cf.collection_id, cf.user_id, row_number() OVER (
					PARTITION BY cf.user_id ORDER BY c.name ASC, c.id ASC
				) - 1 AS rank
				FROM collection_followers cf
				JOIN collections c ON c.id = cf.collection_id
			) AS ordered
			WHERE target.collection_id = ordered.collection_id
			  AND target.user_id = ordered.user_id;
		`);
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropIndex(['user_id', 'position']);
			table.dropColumn('position');
		});
	}
}
