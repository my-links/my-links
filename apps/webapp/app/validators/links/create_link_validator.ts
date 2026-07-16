import vine from '@vinejs/vine';

import { baseLinkValidator } from '#validators/links/base_link_validator';

export const createLinkValidator = vine.create(
	vine.object({
		...baseLinkValidator.getProperties(),
	})
);
