import { belongsTo, column, manyToMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations';

import Link from '#models/link';
import User from '#models/user';
import { CollectionSchema } from '#database/schema';
import type { Visibility } from '#enums/collections/visibility';

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
}
