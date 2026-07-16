import vine from '@vinejs/vine';

import { params } from '#validators/params_object';
import { baseLinkValidator } from '#validators/links/base_link_validator';

export const updateLinkValidator = vine.create(
	vine.object({
		...baseLinkValidator.getProperties(),

		params,
	})
);
