import { params } from '#core/validators/params_object';
import vine from '@vinejs/vine';

export const updateLinkFavoriteStatusValidator = vine.compile(
	vine.object({
		favorite: vine.boolean(),

		params,
	})
);
