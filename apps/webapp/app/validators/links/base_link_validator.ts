import vine from '@vinejs/vine';

export const baseLinkValidator = vine.object({
	name: vine.string().trim().minLength(1).maxLength(254),
	description: vine.string().trim().maxLength(300).optional(),
	url: vine.string().normalizeUrl({ defaultProtocol: 'https' }).trim(),
	favorite: vine.boolean(),
	collectionIds: vine.array(vine.number()).minLength(1),
});
