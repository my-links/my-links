import { baseLinkValidator } from '#validators/links/base_link_validator';
import vine from '@vinejs/vine';

export const createLinkValidator = vine.create(
	vine.object({
		...baseLinkValidator.getProperties(),
	})
);
