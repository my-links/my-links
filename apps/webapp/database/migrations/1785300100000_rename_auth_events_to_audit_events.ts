import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	async up() {
		void this.schema.renameTable('auth_events', 'audit_events');
	}

	async down() {
		void this.schema.renameTable('audit_events', 'auth_events');
	}
}
