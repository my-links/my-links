import { belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

import User from '#models/user';
import AppBaseModel from '#models/app_base_model';
import type { AuthEventType } from '#constants/auth';

export default class AuthEvent extends AppBaseModel {
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
	declare type: AuthEventType;

	@column()
	declare ip: string | null;

	@column()
	declare userAgent: string | null;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;

	@belongsTo(() => User, { foreignKey: 'actorId' })
	declare actor: BelongsTo<typeof User>;
}
