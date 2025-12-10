import { Visibility } from '#enums/collections/visibility';
import { params } from '#validators/params_object';
import vine from '@vinejs/vine';

export const updateCollectionValidator = vine.compile(
	vine.object({
		name: vine.string().trim().minLength(1).maxLength(254),
		description: vine.string().trim().maxLength(254).nullable(),
		visibility: vine.enum(Visibility),

		params,
	})
);
