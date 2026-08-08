import { BaseTransformer } from '@adonisjs/core/transformers';

import type AuditEvent from '#models/audit_event';

/**
 * One line of the authentication journal.
 *
 * The two accounts are rendered as an avatar and a display name, nothing more:
 * the journal is a list of events, not a directory, and an administrator who
 * wants the rest of an account reads it in the accounts table. A row whose
 * account has since been deleted keeps its event and loses its name — that is
 * what the `SET NULL` on both foreign keys buys.
 */
export default class AuthEventTransformer extends BaseTransformer<AuditEvent> {
	toObject() {
		return {
			...this.pick(this.resource, ['id', 'type', 'ip', 'userAgent']),
			fullname: this.resource.user?.fullname ?? null,
			avatarUrl: this.resource.user?.avatarUrl ?? null,
			actorFullname: this.resource.actor?.fullname ?? null,
			actorAvatarUrl: this.resource.actor?.avatarUrl ?? null,
			createdAt: this.resource.createdAt?.toString(),
		};
	}
}
