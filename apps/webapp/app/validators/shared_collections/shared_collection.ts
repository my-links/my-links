import { params } from '#validators/params_object';
import vine from '@vinejs/vine';

export const getSharedCollectionValidator = vine.create(
	vine.object({
		params,
	})
);
