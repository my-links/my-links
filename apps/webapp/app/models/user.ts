import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens';
import type {
	HasMany,
	HasOne,
	ManyToMany,
} from '@adonisjs/lucid/types/relations';
import {
	column,
	computed,
	hasMany,
	hasOne,
	manyToMany,
} from '@adonisjs/lucid/orm';

import Link from '#models/link';
import OauthAuth from '#models/oauth_auth';
import Collection from '#models/collection';
import AuditEvent from '#models/audit_event';
import { UserSchema } from '#database/schema';
import PasswordAuth from '#models/password_auth';

export default class User extends UserSchema {
	@column()
	declare nickName: string; // public username

	@hasOne(() => PasswordAuth)
	declare passwordAuth: HasOne<typeof PasswordAuth>;

	@hasMany(() => OauthAuth)
	declare oauthAuths: HasMany<typeof OauthAuth>;

	@hasMany(() => AuditEvent)
	declare auditEvents: HasMany<typeof AuditEvent>;

	@hasMany(() => Collection, {
		foreignKey: 'authorId',
	})
	declare collections: HasMany<typeof Collection>;

	@hasMany(() => Link, {
		foreignKey: 'authorId',
	})
	declare links: HasMany<typeof Link>;

	@manyToMany(() => Collection, {
		pivotTable: 'collection_followers',
		localKey: 'id',
		relatedKey: 'id',
		pivotForeignKey: 'user_id',
		pivotRelatedForeignKey: 'collection_id',
		pivotTimestamps: {
			createdAt: 'created_at',
			updatedAt: false,
		},
	})
	declare followedCollections: ManyToMany<typeof Collection>;

	@computed()
	get fullname() {
		return this.nickName || this.name;
	}

	static accessTokens = DbAccessTokensProvider.forModel(User);
}
