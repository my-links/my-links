import { Visibility } from '#collections/enums/visibility';
import { params } from '#core/validators/params_object';
import vine from '@vinejs/vine';

export const updateCollectionValidator = vine.compile(
	vine.object({
		name: vine.string().trim().minLength(1).maxLength(254),
		description: vine.string().trim().maxLength(254).nullable(),
		visibility: vine.enum(Visibility),
		nextId: vine.number().optional(),

		params,
	})
);
