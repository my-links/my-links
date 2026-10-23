import {
	beforeCreate,
	CamelCaseNamingStrategy,
	column,
	computed,
} from '@adonisjs/lucid/orm';
import crypto from 'node:crypto';

import { UserSessionSchema } from '#database/schema';
import type { SessionData } from '#types/session';

export default class UserSession extends UserSessionSchema {
	static readonly namingStrategy = new CamelCaseNamingStrategy();
	static readonly selfAssignPrimaryKey = true;

	@column()
	declare userId: string;

	@computed()
	get client(): SessionData | null {
		// In database, the data is serialized as a signed JSON string
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
