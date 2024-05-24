import { defaultTableFields } from '#database/default_table_fields';
import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateUsersTable extends BaseSchema {
  static tableName = 'users';

  async up() {
    this.schema.createTableIfNotExists(CreateUsersTable.tableName, (table) => {
      table.string('email', 254).notNullable().unique();
      table.string('name', 254).notNullable();
      table.string('nick_name', 254).nullable();
      table.text('avatar_url').notNullable();
      table.boolean('is_admin').defaultTo(0).notNullable();

      table.json('token').nullable();
      table.string('provider_id').notNullable();
      table.enum('provider_type', ['google']).notNullable().defaultTo('google');

      defaultTableFields(table);
    });
  }

  async down() {
    this.schema.dropTable(CreateUsersTable.tableName);
  }
}
