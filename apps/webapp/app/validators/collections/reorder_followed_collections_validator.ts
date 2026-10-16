import vine from '@vinejs/vine';

import { databaseIdListSchema } from '#validators/rules/database_id_schema';

export const reorderFollowedCollectionsValidator = vine.create(
	vine.object({
		collectionIds: databaseIdListSchema().distinct().minLength(1),
	})
);
