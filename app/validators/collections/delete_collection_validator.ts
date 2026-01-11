import { params } from '#validators/params_object';
import vine from '@vinejs/vine';

export const deleteCollectionValidator = vine.create(
	vine.object({
		params,
	})
);
