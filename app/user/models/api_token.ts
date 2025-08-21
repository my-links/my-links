import AppBaseModel from '#core/models/app_base_model';
import User from '#user/models/user';
import { beforeSave, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import { DateTime } from 'luxon';
import { randomBytes } from 'node:crypto';

export default class ApiToken extends AppBaseModel {
	@column()
	declare userId: number;

	@column()
	declare name: string;

	@column()
	declare token: string;

	@column.dateTime()
	declare lastUsedAt: DateTime | null;

	@column.dateTime()
	declare expiresAt: DateTime | null;

	@column()
	declare isActive: boolean;

	@belongsTo(() => User, {
		foreignKey: 'userId',
	})
	declare user: BelongsTo<typeof User>;

	isExpired(): boolean {
		if (!this.expiresAt) return false;
		return DateTime.now() > this.expiresAt;
	}

	isValid(): boolean {
		return this.isActive && !this.isExpired();
	}

	async markAsUsed(): Promise<void> {
		this.lastUsedAt = DateTime.now();
		await this.save();
	}

	@beforeSave()
	static async generateToken(token: ApiToken) {
		if (!token.token) {
			token.token = randomBytes(32).toString('hex');
		}
	}
}
