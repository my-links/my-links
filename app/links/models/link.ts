import Collection from '#collections/models/collection';
import AppBaseModel from '#core/models/app_base_model';
import User from '#user/models/user';
import { belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

export default class Link extends AppBaseModel {
	@column()
	declare name: string;

	@column()
	declare description: string | null;

	@column()
	declare url: string;

	@column()
	declare favorite: boolean;

	@column()
	declare collectionId: number;

	@belongsTo(() => Collection, { foreignKey: 'collectionId' })
	declare collection: BelongsTo<typeof Collection>;

	@column()
	declare authorId: number;

	@belongsTo(() => User, { foreignKey: 'authorId' })
	declare author: BelongsTo<typeof User>;
}
