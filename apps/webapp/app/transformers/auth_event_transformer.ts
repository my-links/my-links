import { BaseTransformer } from '@adonisjs/core/transformers';

import { maskIp } from '#lib/network/mask_ip';
import type AuditEvent from '#models/audit_event';

/**
 * One line of the authentication journal.
 *
 * The two accounts are rendered as an avatar and a display name, nothing more:
 * the journal is a list of events, not a directory, and an administrator who
 * wants the rest of an account reads it in the accounts table. A row whose
 * account has since been deleted keeps its event and loses its name: that is
 * what the `SET NULL` on both foreign keys buys.
 *
 * The address is sent as its network only: the full value stays in the
 * database, the dashboard has no use for more.
 */
export default class AuthEventTransformer extends BaseTransformer<AuditEvent> {
	toObject() {
		return {
			...this.pick(this.resource, ['id', 'type', 'userAgent']),
			maskedIp: maskIp(this.resource.ip),
			fullname: this.resource.user?.fullname ?? null,
			actorFullname: this.resource.actor?.fullname ?? null,
			createdAt: this.resource.createdAt?.toString(),
		};
	}
}
