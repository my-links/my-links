import { baseLinkValidator } from '#validators/links/base_link_validator';
import { params } from '#validators/params_object';
import vine from '@vinejs/vine';

export const updateLinkValidator = vine.create(
	vine.object({
		...baseLinkValidator.getProperties(),

		params,
	})
);
