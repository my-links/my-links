import vine from '@vinejs/vine';

import { params } from '#validators/params_object';

export const deleteLinkValidator = vine.create(
	vine.object({
		params,
	})
);
