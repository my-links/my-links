import { BaseTransformer } from '@adonisjs/core/transformers';

import type AuditEvent from '#models/audit_event';

/**
 * One line of the activity journal.
 *
 * `subjectId` names a row, never its content — the transformer carries an
 * identifier, and rendering it as `link #4102` rather than a title is a
 * decision the UI makes, not this layer.
 */
export default class ActivityEventTransformer extends BaseTransformer<AuditEvent> {
	toObject() {
		return {
			...this.pick(this.resource, [
				'id',
				'type',
				'subjectType',
				'subjectId',
				'metadata',
				'ip',
				'userAgent',
			]),
			fullname: this.resource.user?.fullname ?? null,
			avatarUrl: this.resource.user?.avatarUrl ?? null,
			actorFullname: this.resource.actor?.fullname ?? null,
			actorAvatarUrl: this.resource.actor?.avatarUrl ?? null,
			createdAt: this.resource.createdAt?.toString(),
		};
	}
}
