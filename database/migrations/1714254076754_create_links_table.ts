import { defaultTableFields } from '#database/default_table_fields';
import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateLinksTable extends BaseSchema {
  static tableName = 'links';

  async up() {
    this.schema.createTableIfNotExists(CreateLinksTable.tableName, (table) => {
      table.string('name', 254).notNullable();
      table.string('description', 254).nullable();
      table.text('url').notNullable();
      table.boolean('favorite').notNullable().defaultTo(0);
      table
        .integer('collection_id')
        .references('id')
        .inTable('collections')
        .onDelete('CASCADE');
      table
        .integer('author_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      defaultTableFields(table);
    });
  }

  async down() {
    this.schema.dropTable(CreateLinksTable.tableName);
  }
}
