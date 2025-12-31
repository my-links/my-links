import AppBaseModel from '#models/app_base_model';
import Collection from '#models/collection';
import Link from '#models/link';
import type { GoogleToken } from '@adonisjs/ally/types';
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens';
import { column, computed, hasMany, manyToMany } from '@adonisjs/lucid/orm';
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations';
import { DateTime } from 'luxon';

export default class User extends AppBaseModel {
	@column()
	declare email: string;

	@column()
	declare name: string;

	@column()
	declare nickName: string; // public username

	@column()
	declare avatarUrl: string;

	@column()
	declare isAdmin: boolean;

	@column({ serializeAs: null })
	declare token?: GoogleToken;

	@column({ serializeAs: null })
	declare providerId: number;

	@column({ serializeAs: null })
	declare providerType: 'google';

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

	@column.dateTime({
		autoCreate: true,
		autoUpdate: true,
	})
	declare lastSeenAt: DateTime;

	static accessTokens = DbAccessTokensProvider.forModel(User);
}
