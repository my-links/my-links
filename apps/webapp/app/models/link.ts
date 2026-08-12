import { belongsTo, column, manyToMany, scope } from '@adonisjs/lucid/orm';
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations';

import User from '#models/user';
import Collection from '#models/collection';
import { LinkSchema } from '#database/schema';

export default class Link extends LinkSchema {
	@manyToMany(() => Collection, {
		pivotTable: 'collection_link',
		localKey: 'id',
		relatedKey: 'id',
		pivotForeignKey: 'link_id',
		pivotRelatedForeignKey: 'collection_id',
		pivotColumns: ['position'],
		pivotTimestamps: {
			createdAt: 'created_at',
			updatedAt: false,
		},
	})
	declare collections: ManyToMany<typeof Collection>;

	@column()
	declare authorId: number;

	@belongsTo(() => User, { foreignKey: 'authorId' })
	declare author: BelongsTo<typeof User>;

	static ownedBy = scope((query, userId: User['id']) => {
		query.where('author_id', userId);
	});

	/**
	 * How a collection's links are ordered wherever they're preloaded
	 * through the `collection_link` pivot.
	 */
	static orderedInCollection = scope((query) => {
		query
			.orderBy('collection_link.position', 'asc')
			.orderBy('links.name', 'asc');
	});
}
