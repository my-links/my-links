import vine from '@vinejs/vine';

import { Visibility } from '#enums/collections/visibility';

export const reorderCollectionsValidator = vine.create(
	vine.object({
		visibility: vine.enum(Visibility),
		collectionIds: vine.array(vine.number().positive()).distinct().minLength(1),
	})
);
