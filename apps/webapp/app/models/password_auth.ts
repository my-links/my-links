import { DateTime } from 'luxon';
import hash from '@adonisjs/core/services/hash';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import { beforeSave, belongsTo, column } from '@adonisjs/lucid/orm';

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
