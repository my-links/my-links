import { BaseSchema } from '@adonisjs/lucid/schema';

/**
 * One Inbox per account, enforced by the database.
 *
 * The dashboard opens the Inbox on read when an account somehow lacks one, so
 * two concurrent first loads could otherwise each insert their own.
 */
export default class extends BaseSchema {
	protected tableName = 'collections';
	private readonly indexName = 'collections_one_inbox_per_author';

	async up() {
		this.schema.raw(
			`CREATE UNIQUE INDEX ${this.indexName}
			 ON ${this.tableName} (author_id)
			 WHERE is_default`
		);
	}

	async down() {
		this.schema.raw(`DROP INDEX IF EXISTS ${this.indexName}`);
	}
}
