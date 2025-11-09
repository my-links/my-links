import vine from '@vinejs/vine';

export const baseLinkValidator = vine.object({
	name: vine.string().trim().minLength(1).maxLength(254),
	description: vine.string().trim().maxLength(300).optional(),
	url: vine.string().url({ require_tld: false }).trim(),
	favorite: vine.boolean(),
	collectionId: vine.number(),
});
