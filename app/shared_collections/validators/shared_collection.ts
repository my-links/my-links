import { params } from '#core/validators/params_object';
import vine from '@vinejs/vine';

export const getSharedCollectionValidator = vine.compile(
	vine.object({
		params,
	})
);
