import AppBaseModel from '#models/app_base_model';
import Link from '#models/link';
import User from '#models/user';
import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import { Visibility } from '#enums/visibility';

export default class Collection extends AppBaseModel {
	@column()
	declare name: string;

	@column()
	declare description: string | null;

	@column()
	declare visibility: Visibility;

	@column()
	declare nextId: number;

	@column()
	declare authorId: number;

	@belongsTo(() => User, { foreignKey: 'authorId' })
	declare author: BelongsTo<typeof User>;

	@hasMany(() => Link)
	declare links: HasMany<typeof Link>;
}
