import vine from '@vinejs/vine';

import { params } from '#validators/params_object';

export const refreshLinkFaviconValidator = vine.create(
	vine.object({
		params,
	})
);
