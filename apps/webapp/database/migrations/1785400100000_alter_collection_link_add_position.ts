import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'collection_link';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.integer('position').notNullable().defaultTo(0);
			table.index(['collection_id', 'position']);
		});

		this.schema.raw(`
			UPDATE collection_link AS target
			SET position = ordered.rank
			FROM (
				SELECT cl.collection_id, cl.link_id, row_number() OVER (
					PARTITION BY cl.collection_id ORDER BY l.name ASC, l.id ASC
				) - 1 AS rank
				FROM collection_link cl
				JOIN links l ON l.id = cl.link_id
			) AS ordered
			WHERE target.collection_id = ordered.collection_id
			  AND target.link_id = ordered.link_id;
		`);
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropIndex(['collection_id', 'position']);
			table.dropColumn('position');
		});
	}
}
