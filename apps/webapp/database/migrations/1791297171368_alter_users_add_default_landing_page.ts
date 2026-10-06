import { BaseSchema } from '@adonisjs/lucid/schema';

import { LANDING_PAGE } from '#enums/dashboard/landing_page';

export default class extends BaseSchema {
	protected tableName = 'users';
	private landingPageEnumName = 'user_landing_page';

	async up() {
		this.schema.raw(`DROP TYPE IF EXISTS ${this.landingPageEnumName}`);
		this.schema.alterTable(this.tableName, (table) => {
			table
				.enum('default_landing_page', Object.values(LANDING_PAGE), {
					useNative: true,
					enumName: this.landingPageEnumName,
					existingType: false,
				})
				.notNullable()
				.defaultTo(LANDING_PAGE.FAVORITES);
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('default_landing_page');
		});
		this.schema.raw(`DROP TYPE IF EXISTS ${this.landingPageEnumName}`);
	}
}
