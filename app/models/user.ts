import type { GoogleToken } from '@adonisjs/ally/types';
import { beforeCreate, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import AppBaseModel from './app_base_model.js';

export default class User extends AppBaseModel {
  static selfAssignPrimaryKey = true;

  @column({ isPrimary: true })
  declare id: string; // UUID

  @column()
  declare email: string;

  @column()
  declare name: string;

  @column({ serializeAs: 'nickName' })
  declare nickName: string; // public username

  @column({ serializeAs: 'avatarUrl' })
  declare avatarUrl: string;

  declare isAdmin: boolean;

  @column({ serializeAs: null })
  declare token: GoogleToken;

  @column({ serializeAs: null })
  declare providerId: string;

  @column.dateTime({
    autoCreate: true,
    serialize: (value: DateTime) => value.toISODate(),
    serializeAs: 'createdAt',
  })
  declare createdAt: DateTime;

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    serialize: (value: DateTime) => value.toISODate(),
    serializeAs: 'updatedAt',
  })
  declare updatedAt: DateTime;

  @beforeCreate()
  static assignUuid(user: User) {
    user.id = uuidv4();
    user.isAdmin = false;
  }
}
