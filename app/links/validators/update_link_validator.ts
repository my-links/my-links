import { params } from '#core/validators/params_object';
import { baseLinkValidator } from '#links/validators/base_link_validator';
import vine from '@vinejs/vine';

export const updateLinkValidator = vine.compile(
	vine.object({
		...baseLinkValidator.getProperties(),

		params,
	})
);
