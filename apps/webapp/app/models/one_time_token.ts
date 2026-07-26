import { DateTime } from 'luxon';
import { belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

import User from '#models/user';
import AppBaseModel from '#models/app_base_model';
import type { OneTimeTokenType } from '#constants/auth';

export default class OneTimeToken extends AppBaseModel {
	@column()
	declare userId: number;

	@column()
	declare type: OneTimeTokenType;

	@column({ serializeAs: null })
	declare tokenHash: string;

	@column.dateTime()
	declare expiresAt: DateTime;

	@column.dateTime()
	declare consumedAt: DateTime | null;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;
}
