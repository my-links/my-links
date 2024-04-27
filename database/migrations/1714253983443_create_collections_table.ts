import { Visibility } from '#models/collection';
import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'collections';
  private visibilityEnumName = 'collection_visibility';

  async up() {
    this.schema.raw(`DROP TYPE IF EXISTS ${this.visibilityEnumName}`);
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable();

      table.string('name', 254).notNullable();
      table.string('description', 254);
      table.uuid('next_id').notNullable();
      table.uuid('author_id').notNullable();
      table.enum('visibility', Object.values(Visibility), {
        useNative: true,
        enumName: this.visibilityEnumName,
        existingType: false,
      });

      table.timestamp('created_at');
      table.timestamp('updated_at');
    });
  }

  async down() {
    this.schema.raw(`DROP TYPE IF EXISTS ${this.visibilityEnumName}`);
    this.schema.dropTable(this.tableName);
  }
}
