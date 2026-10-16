import vine from '@vinejs/vine';

import { databaseIdListSchema } from '#validators/rules/database_id_schema';

export const bulkDeleteUsersValidator = vine.create(
	vine.object({
		userIds: databaseIdListSchema().minLength(1).distinct(),
	})
);
