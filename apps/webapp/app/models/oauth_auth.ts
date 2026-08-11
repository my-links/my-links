import { belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

import User from '#models/user';
import { OauthAuthSchema } from '#database/schema';
import type { AuthProvider } from '#constants/auth';

export default class OauthAuth extends OauthAuthSchema {
	@column()
	declare provider: AuthProvider;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;
}
