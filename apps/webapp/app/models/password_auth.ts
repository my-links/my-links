import { DateTime } from 'luxon';
import { belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

import User from '#models/user';
import AppBaseModel from '#models/app_base_model';

export default class PasswordAuth extends AppBaseModel {
	@column()
	declare userId: number;

	@column({ serializeAs: null })
	declare password: string;

	@column.dateTime()
	declare passwordChangedAt: DateTime | null;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;
}
