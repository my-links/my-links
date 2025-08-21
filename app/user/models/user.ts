import Collection from '#collections/models/collection';
import AppBaseModel from '#core/models/app_base_model';
import Link from '#links/models/link';
import { type DisplayPreferences } from '#shared/types/index';
import { ensureDisplayPreferences } from '#user/lib/index';
import ApiToken from '#user/models/api_token';
import type { GoogleToken } from '@adonisjs/ally/types';
import { column, computed, hasMany } from '@adonisjs/lucid/orm';
import type { HasMany } from '@adonisjs/lucid/types/relations';
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

	@hasMany(() => ApiToken, {
		foreignKey: 'userId',
	})
	declare apiTokens: HasMany<typeof ApiToken>;

	@computed()
	get fullname() {
		return this.nickName || this.name;
	}

	@column.dateTime({
		autoCreate: true,
		autoUpdate: true,
	})
	declare lastSeenAt: DateTime;

	@column({
		serialize: (value) => {
			if (typeof value === 'string') {
				return ensureDisplayPreferences(JSON.parse(value));
			}
			return value;
		},
		prepare: (value) => JSON.stringify(value),
	})
	declare displayPreferences: DisplayPreferences;
}
