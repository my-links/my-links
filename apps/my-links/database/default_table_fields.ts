import { Knex } from 'knex';

export function defaultTableFields(table: Knex.CreateTableBuilder) {
	table.increments('id').primary().first().unique().notNullable();

	table.timestamp('created_at').notNullable();
	table.timestamp('updated_at').nullable();
}
