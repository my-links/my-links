import { BaseModel, CamelCaseNamingStrategy, beforeCreate, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

export default class AppBaseModel extends BaseModel {
  static namingStrategy = new CamelCaseNamingStrategy();
  static selfAssignPrimaryKey = true;

  @column({ isPrimary: true })
  declare id: string; // UUID

  @column.dateTime({
    autoCreate: true,
    serializeAs: 'createdAt',
  })
  declare createdAt: DateTime;

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    serializeAs: 'updatedAt',
  })
  declare updatedAt: DateTime;

  @beforeCreate()
  static assignUuid(item: any) {
    item.id = uuidv4();
  }
}
