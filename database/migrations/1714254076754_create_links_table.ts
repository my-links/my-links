import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'links';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable();

      table.string('name', 254).notNullable();
      table.string('description', 254);
      table.text('url').notNullable();
      table.boolean('favorite').notNullable().defaultTo(0);
      table.uuid('collection_id').notNullable();
      table.uuid('author_id').notNullable();

      table.timestamp('created_at');
      table.timestamp('updated_at');
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
