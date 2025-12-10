import { params } from '#validators/params_object';
import vine from '@vinejs/vine';

export const deleteCollectionValidator = vine.compile(
	vine.object({
		params,
	})
);
