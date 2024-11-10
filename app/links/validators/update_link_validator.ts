import { params } from '#core/validators/params_object';
import vine from '@vinejs/vine';

export const updateLinkValidator = vine.compile(
	vine.object({
		name: vine.string().trim().minLength(1).maxLength(254),
		description: vine.string().trim().maxLength(300).optional(),
		url: vine.string().trim(),
		favorite: vine.boolean(),
		collectionId: vine.number(),

		params,
	})
);
