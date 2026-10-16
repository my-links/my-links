import vine from '@vinejs/vine';

import { params } from '#validators/params_object';
import { databaseIdSchema } from '#validators/rules/database_id_schema';

export const addLinkToCollectionValidator = vine.create(
	vine.object({
		params,
		collectionId: databaseIdSchema,
	})
);
