import vine from '@vinejs/vine';

import { params } from '#validators/params_object';

export const getSharedCollectionValidator = vine.create(
	vine.object({
		params,
	})
);
