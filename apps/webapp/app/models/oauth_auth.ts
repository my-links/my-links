import { DateTime } from 'luxon';
import { belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

import User from '#models/user';
import AppBaseModel from '#models/app_base_model';
import type { AuthProvider } from '#constants/auth';

export default class OauthAuth extends AppBaseModel {
	@column()
	declare userId: number;

	@column()
	declare provider: AuthProvider;

	@column()
	declare providerUserId: string;

	@column.dateTime()
	declare linkedAt: DateTime;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;
}
