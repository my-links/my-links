import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'users';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable();

      table.string('email', 254).notNullable().unique();
      table.string('name', 254).notNullable();
      table.string('nick_name', 254).notNullable();
      table.text('avatar_url').notNullable();
      table.boolean('is_admin').defaultTo(0).notNullable();

      table.json('token').notNullable();
      table.string('provider_id').notNullable();

      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').nullable();
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
