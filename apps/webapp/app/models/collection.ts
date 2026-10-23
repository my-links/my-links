import { belongsTo, column, manyToMany, scope } from '@adonisjs/lucid/orm';
import db from '@adonisjs/lucid/services/db';
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations';

import { CollectionSchema } from '#database/schema';
import { VISIBILITY, type Visibility } from '#enums/collections/visibility';
import Link from '#models/link';
import User from '#models/user';

export default class Collection extends CollectionSchema {
	@column()
	declare visibility: Visibility;

	@column()
	declare authorId: number;

	@belongsTo(() => User, { foreignKey: 'authorId' })
	declare author: BelongsTo<typeof User>;

	@manyToMany(() => Link, {
		pivotTable: 'collection_link',
		localKey: 'id',
		relatedKey: 'id',
		pivotForeignKey: 'collection_id',
		pivotRelatedForeignKey: 'link_id',
		pivotColumns: ['position'],
		pivotTimestamps: {
			createdAt: 'created_at',
			updatedAt: false,
		},
	})
	declare links: ManyToMany<typeof Link>;

	@manyToMany(() => User, {
		pivotTable: 'collection_followers',
		localKey: 'id',
		relatedKey: 'id',
		pivotForeignKey: 'collection_id',
		pivotRelatedForeignKey: 'user_id',
		pivotColumns: ['position'],
		pivotTimestamps: {
			createdAt: 'created_at',
			updatedAt: false,
		},
	})
	declare followers: ManyToMany<typeof User>;

	/**
	 * Public, and not authored by an account in its deletion grace period:
	 * that account asked to disappear, so its collections stop being served
	 * to anyone but itself.
	 */
	static publiclyVisible = scope((query) => {
		query
			.where('visibility', VISIBILITY.PUBLIC)
			.whereIn(
				'author_id',
				db.from('users').select('id').whereNull('pending_deletion_at')
			);
	});

	static ownedBy = scope((query, userId: User['id']) => {
		query.where('author_id', userId);
	});
}
