import { belongsTo, column, manyToMany } from '@adonisjs/lucid/orm';
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
}
