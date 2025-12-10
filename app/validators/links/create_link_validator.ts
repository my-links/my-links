import { baseLinkValidator } from '#validators/links/base_link_validator';
import vine from '@vinejs/vine';

export const createLinkValidator = vine.compile(
	vine.object({
		...baseLinkValidator.getProperties(),
	})
);
