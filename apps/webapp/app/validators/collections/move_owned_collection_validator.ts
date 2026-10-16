import vine from '@vinejs/vine';

import { params } from '#validators/params_object';
import { VISIBILITY } from '#enums/collections/visibility';
import { databaseIdListSchema } from '#validators/rules/database_id_schema';

export const moveOwnedCollectionValidator = vine.create(
	vine.object({
		visibility: vine.enum(VISIBILITY),
		collectionIds: databaseIdListSchema().distinct().minLength(1),

		params,
	})
);
