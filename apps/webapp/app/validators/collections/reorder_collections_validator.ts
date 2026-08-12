import vine from '@vinejs/vine';

import { VISIBILITY } from '#enums/collections/visibility';

export const reorderCollectionsValidator = vine.create(
	vine.object({
		visibility: vine.enum(VISIBILITY),
		collectionIds: vine.array(vine.number().positive()).distinct().minLength(1),
	})
);
