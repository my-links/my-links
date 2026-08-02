import { belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

import User from '#models/user';
import AppBaseModel from '#models/app_base_model';
import type { AuditEventType, AuditSubjectType } from '#constants/audit';

export default class AuditEvent extends AppBaseModel {
	@column()
	declare userId: number | null;

	/**
	 * Whoever caused the event, when that is not the account it happened to —
	 * an administrator acting from the dashboard. Null everywhere else, which
	 * is what "the account did this itself" looks like.
	 */
	@column()
	declare actorId: number | null;

	@column()
	declare type: AuditEventType;

	@column()
	declare ip: string | null;

	@column()
	declare userAgent: string | null;

	/**
	 * Null for an authentication event. Set for an activity event, together
	 * with `subjectId`, to say what the event happened to without saying
	 * anything about its content.
	 */
	@column()
	declare subjectType: AuditSubjectType | null;

	@column()
	declare subjectId: number | null;

	@column()
	declare metadata: Record<string, unknown> | null;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;

	@belongsTo(() => User, { foreignKey: 'actorId' })
	declare actor: BelongsTo<typeof User>;
}
