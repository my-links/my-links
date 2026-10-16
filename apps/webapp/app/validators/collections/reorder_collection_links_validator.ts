import vine from '@vinejs/vine';

import { params } from '#validators/params_object';
import { databaseIdListSchema } from '#validators/rules/database_id_schema';

export const reorderCollectionLinksValidator = vine.create(
	vine.object({
		params,
		linkIds: databaseIdListSchema().distinct().minLength(1),
	})
);
