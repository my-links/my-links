import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'collections';

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.integer('position').notNullable().defaultTo(0);
			table.index(['author_id', 'visibility', 'position']);
		});

		this.schema.raw(`
			UPDATE collections AS target
			SET position = ordered.rank
			FROM (
				SELECT id, row_number() OVER (
					PARTITION BY author_id, visibility ORDER BY name ASC, id ASC
				) - 1 AS rank
				FROM collections
			) AS ordered
			WHERE target.id = ordered.id;
		`);
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropIndex(['author_id', 'visibility', 'position']);
			table.dropColumn('position');
		});
	}
}
