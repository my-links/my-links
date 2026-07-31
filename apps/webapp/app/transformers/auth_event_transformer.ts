import { BaseTransformer } from '@adonisjs/core/transformers';

import type AuthEvent from '#models/auth_event';

/**
 * One line of the authentication journal.
 *
 * The two accounts are rendered as an address and nothing more: the journal is
 * a list of events, not a directory, and an administrator who wants the rest of
 * an account reads it in the accounts table. A row whose account has since been
 * deleted keeps its event and loses its name — that is what the `SET NULL` on
 * both foreign keys buys.
 */
export default class AuthEventTransformer extends BaseTransformer<AuthEvent> {
	toObject() {
		return {
			...this.pick(this.resource, ['id', 'type', 'ip', 'userAgent']),
			email: this.resource.user?.email ?? null,
			actorEmail: this.resource.actor?.email ?? null,
			createdAt: this.resource.createdAt?.toString(),
		};
	}
}
