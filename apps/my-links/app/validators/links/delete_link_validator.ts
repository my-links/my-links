import { params } from '#validators/params_object';
import vine from '@vinejs/vine';

export const deleteLinkValidator = vine.create(
	vine.object({
		params,
	})
);
