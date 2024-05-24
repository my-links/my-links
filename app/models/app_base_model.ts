import {
  BaseModel,
  CamelCaseNamingStrategy,
  column,
} from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';

export default class AppBaseModel extends BaseModel {
  static namingStrategy = new CamelCaseNamingStrategy();
  static selfAssignPrimaryKey = true;

  @column({ isPrimary: true })
  declare id: number;

  @column.dateTime({
    autoCreate: true,
    serializeAs: 'created_at',
  })
  declare created_at: DateTime;

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    serializeAs: 'updated_at',
  })
  declare updated_at: DateTime;
}
