import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'collection_link';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('collection_id')
        .references('id')
        .inTable('collections')
        .onDelete('CASCADE');
      table
        .uuid('link_id')
        .references('id')
        .inTable('links')
        .onDelete('CASCADE');
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
