import vine from '@vinejs/vine';

import { params } from '#validators/params_object';

export const visitLinkValidator = vine.create(
	vine.object({
		params,
	})
);
