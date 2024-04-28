import Collection from '#models/collection';
import Link from '#models/link';
import type { GoogleToken } from '@adonisjs/ally/types';
import { column, manyToMany } from '@adonisjs/lucid/orm';
import type { ManyToMany } from '@adonisjs/lucid/types/relations';
import AppBaseModel from './app_base_model.js';

export default class User extends AppBaseModel {
  @column()
  declare email: string;

  @column()
  declare name: string;

  @column({ serializeAs: 'nickName' })
  declare nickName: string; // public username

  @column({ serializeAs: 'avatarUrl' })
  declare avatarUrl: string;

  @column()
  declare isAdmin: boolean;

  @column({ serializeAs: null })
  declare token: GoogleToken;

  @column({ serializeAs: null })
  declare providerId: string;

  @manyToMany(() => Collection, {
    relatedKey: 'authorId',
  })
  declare collections: ManyToMany<typeof Collection>;

  @manyToMany(() => Link, {
    relatedKey: 'authorId',
  })
  declare links: ManyToMany<typeof Link>;
}
