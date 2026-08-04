import vine from '@vinejs/vine';

import { params } from '#validators/params_object';

export const moveLinkValidator = vine.create(
	vine.object({
		params,
		fromCollectionId: vine.number().positive(),
		toCollectionId: vine.number().positive(),
	})
);
