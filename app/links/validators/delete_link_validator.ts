import { params } from '#core/validators/params_object';
import vine from '@vinejs/vine';

export const deleteLinkValidator = vine.compile(
	vine.object({
		params,
	})
);
