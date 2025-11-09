import { baseLinkValidator } from '#links/validators/base_link_validator';
import vine from '@vinejs/vine';

export const createLinkValidator = vine.compile(
	vine.object({
		...baseLinkValidator.getProperties(),
	})
);
