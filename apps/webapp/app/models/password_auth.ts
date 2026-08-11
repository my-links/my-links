import hash from '@adonisjs/core/services/hash';
import { beforeSave, belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

import User from '#models/user';
import { PasswordAuthSchema } from '#database/schema';

export default class PasswordAuth extends PasswordAuthSchema {
	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;

	/**
	 * Hashing lives on the model rather than in the callers, so a plain
	 * password cannot reach the database through a code path that forgot to
	 * hash it. The dirty check is what keeps a save that touches another
	 * column from hashing an already hashed value a second time.
	 */
	@beforeSave()
	static async hashPassword(passwordAuth: PasswordAuth): Promise<void> {
		if (!passwordAuth.$dirty.password) return;

		passwordAuth.password = await hash.make(passwordAuth.password);
	}
}
