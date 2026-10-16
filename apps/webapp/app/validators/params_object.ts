import vine from '@vinejs/vine';

import { databaseIdSchema } from '#validators/rules/database_id_schema';

export const params = vine.object({
	id: databaseIdSchema,
});
