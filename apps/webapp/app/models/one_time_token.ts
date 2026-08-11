import { belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

import User from '#models/user';
import { OneTimeTokenSchema } from '#database/schema';
import type { OneTimeTokenType } from '#constants/auth';

export default class OneTimeToken extends OneTimeTokenSchema {
	@column()
	declare type: OneTimeTokenType;

	@column({ serializeAs: null })
	declare tokenHash: string;

	// Only an email change carries one: the address the account moves to when the link is redeemed. Null for every other purpose.
	@column()
	declare newEmail: string | null;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;
}
