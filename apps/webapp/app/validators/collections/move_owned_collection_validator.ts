import vine from '@vinejs/vine';

import { params } from '#validators/params_object';
import { VISIBILITY } from '#enums/collections/visibility';

export const moveOwnedCollectionValidator = vine.create(
	vine.object({
		visibility: vine.enum(VISIBILITY),
		collectionIds: vine.array(vine.number().positive()).distinct().minLength(1),

		params,
	})
);
