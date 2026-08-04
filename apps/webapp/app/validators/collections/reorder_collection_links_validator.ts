import vine from '@vinejs/vine';

import { params } from '#validators/params_object';

export const reorderCollectionLinksValidator = vine.create(
	vine.object({
		params,
		linkIds: vine.array(vine.number().positive()).distinct().minLength(1),
	})
);
