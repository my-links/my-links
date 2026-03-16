import { params } from '#validators/params_object';
import vine from '@vinejs/vine';

export const updateLinkFavoriteStatusValidator = vine.create(
	vine.object({
		favorite: vine.boolean(),

		params,
	})
);
