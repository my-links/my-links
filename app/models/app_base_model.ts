import {
	BaseModel,
	CamelCaseNamingStrategy,
	column,
} from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';

export default class AppBaseModel extends BaseModel {
	static namingStrategy = new CamelCaseNamingStrategy();
	serializeExtras = true;

	@column({ isPrimary: true })
	declare id: number;

	@column.dateTime({
		autoCreate: true,
	})
	declare createdAt: DateTime;

	@column.dateTime({
		autoCreate: true,
		autoUpdate: true,
	})
	declare updatedAt: DateTime;
}
