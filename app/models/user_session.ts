import type { SessionData } from '#types/session';
import encryption from '@adonisjs/core/services/encryption';
import {
	BaseModel,
	beforeCreate,
	CamelCaseNamingStrategy,
	column,
	computed,
} from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import crypto from 'node:crypto';

export default class UserSession extends BaseModel {
	static readonly table = 'user_sessions';
	static readonly namingStrategy = new CamelCaseNamingStrategy();
	static readonly selfAssignPrimaryKey = true;

	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare data: string;
	// In database, the data is serialized as a signed JSON string

	@column()
	declare userId: string;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime()
	declare expiresAt: DateTime;

	@computed()
	get publicId() {
		return this.createPublicId();
	}

	private createPublicId(): string {
		return encryption.encrypt(
			{ userId: this.userId },
			{ purpose: 'session-public-id' }
		);
	}

	@computed()
	get client(): SessionData | null {
		const parsed = JSON.parse(this.data) as {
			message?: { client?: SessionData };
		};

		return parsed.message?.client ?? null;
	}

	@beforeCreate()
	public static assignId(model: UserSession) {
		model.id = crypto.randomUUID();
	}
}
