import vine from '@vinejs/vine';

import { baseLinkValidator } from '#validators/links/base_link_validator';
import { params } from '#validators/params_object';

export const updateLinkValidator = vine.create(
	vine.object({
		...baseLinkValidator.getProperties(),

		params,
	})
);
