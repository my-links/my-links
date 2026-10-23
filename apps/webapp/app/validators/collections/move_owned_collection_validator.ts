import vine from '@vinejs/vine';

import { VISIBILITY } from '#enums/collections/visibility';
import { params } from '#validators/params_object';
import { databaseIdListSchema } from '#validators/rules/database_id_schema';

export const moveOwnedCollectionValidator = vine.create(
	vine.object({
		visibility: vine.enum(VISIBILITY),
		collectionIds: databaseIdListSchema().distinct().minLength(1),

		params,
	})
);
