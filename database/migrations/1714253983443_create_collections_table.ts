import { defaultTableFields } from '#database/default_table_fields';
import { Visibility } from '#enums/visibility';
import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateCollectionTable extends BaseSchema {
  static tableName = 'collections';
  private visibilityEnumName = 'collection_visibility';

  async up() {
    this.schema.raw(`DROP TYPE IF EXISTS ${this.visibilityEnumName}`);
    this.schema.createTableIfNotExists(
      CreateCollectionTable.tableName,
      (table) => {
        table.string('name', 254).notNullable();
        table.string('description', 254).nullable();
        table
          .enum('visibility', Object.values(Visibility), {
            useNative: true,
            enumName: this.visibilityEnumName,
            existingType: false,
          })
          .nullable()
          .defaultTo(Visibility.PRIVATE);
        table
          .integer('next_id')
          .references('id')
          .inTable('collections')
          .defaultTo(null);
        table
          .integer('author_id')
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');

        defaultTableFields(table);
      }
    );
  }

  async down() {
    this.schema.raw(`DROP TYPE IF EXISTS ${this.visibilityEnumName}`);
    this.schema.dropTable(CreateCollectionTable.tableName);
  }
}
