import { params } from '#validators/params_object';
import { baseLinkValidator } from '#validators/links/base_link_validator';
import vine from '@vinejs/vine';

export const updateLinkValidator = vine.compile(
	vine.object({
		...baseLinkValidator.getProperties(),

		params,
	})
);
