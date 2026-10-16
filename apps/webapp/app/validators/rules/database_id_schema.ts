import vine from '@vinejs/vine';

import {
	MAXIMUM_DATABASE_ID,
	MAXIMUM_ID_LIST_LENGTH,
} from '#constants/database';

/**
 * The one shape every numeric id from a client (route params, bodies, id
 * lists) must have, so a negative, fractional or out-of-range value is a
 * validation error instead of a database error.
 */
export const databaseIdSchema = vine
	.number()
	.withoutDecimals()
	.positive()
	.max(MAXIMUM_DATABASE_ID);

export const databaseIdListSchema = () =>
	vine.array(databaseIdSchema).maxLength(MAXIMUM_ID_LIST_LENGTH);
