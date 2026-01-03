import { Visibility } from '#enums/collections/visibility';
import AppBaseModel from '#models/app_base_model';
import Link from '#models/link';
import User from '#models/user';
import { belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm';
import type {
	BelongsTo,
	HasMany,
	ManyToMany,
} from '@adonisjs/lucid/types/relations';

export default class Collection extends AppBaseModel {
	@column()
	declare name: string;

	@column()
	declare description: string | null;

	@column()
	declare visibility: Visibility;

	@column()
	declare icon: string | null;

	@column()
	declare authorId: number;

	@belongsTo(() => User, { foreignKey: 'authorId' })
	declare author: BelongsTo<typeof User>;

	@hasMany(() => Link)
	declare links: HasMany<typeof Link>;

	@manyToMany(() => User, {
		pivotTable: 'collection_followers',
		localKey: 'id',
		relatedKey: 'id',
		pivotForeignKey: 'collection_id',
		pivotRelatedForeignKey: 'user_id',
		pivotTimestamps: {
			createdAt: 'created_at',
			updatedAt: false,
		},
	})
	declare followers: ManyToMany<typeof User>;
}
