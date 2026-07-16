import vine from '@vinejs/vine';

import { params } from '#validators/params_object';

export const deleteCollectionValidator = vine.create(
	vine.object({
		params,
	})
);
