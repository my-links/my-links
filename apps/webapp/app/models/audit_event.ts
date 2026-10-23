import { belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

import type { AuditEventType, AuditSubjectType } from '#constants/audit';
import { AuditEventSchema } from '#database/schema';
import User from '#models/user';

export default class AuditEvent extends AuditEventSchema {
	@column()
	declare type: AuditEventType;

	// Whoever caused the event, when that is not the account it happened to: an administrator acting from the dashboard. Null everywhere else.
	@column()
	declare actorId: number | null;

	@column()
	declare subjectType: AuditSubjectType | null;

	@column()
	declare metadata: Record<string, unknown> | null;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;

	@belongsTo(() => User, { foreignKey: 'actorId' })
	declare actor: BelongsTo<typeof User>;
}
