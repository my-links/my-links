import vine from '@vinejs/vine';

import { params } from '#validators/params_object';

export const addLinkToCollectionValidator = vine.create(
	vine.object({
		params,
		collectionId: vine.number().positive(),
	})
);
