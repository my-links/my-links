import AppBaseModel from '#models/app_base_model';
import Link from '#models/link';
import User from '#models/user';
import { belongsTo, column, manyToMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations';

export default class Collection extends AppBaseModel {
  @column()
  declare name: string;

  @column()
  declare description: string | null;

  @column()
  declare visibility: Visibility;

  @column()
  declare nextId: string;

  @column()
  declare authorId: string;

  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>;

  @manyToMany(() => Link)
  declare links: ManyToMany<typeof Link>;
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}
