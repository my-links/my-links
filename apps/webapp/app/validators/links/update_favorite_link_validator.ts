import vine from '@vinejs/vine';

import { params } from '#validators/params_object';

export const updateLinkFavoriteStatusValidator = vine.create(
	vine.object({
		favorite: vine.boolean(),

		params,
	})
);
