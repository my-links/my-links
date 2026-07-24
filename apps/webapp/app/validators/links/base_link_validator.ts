import vine from '@vinejs/vine';

export const baseLinkValidator = vine.object({
	name: vine.string().trim().minLength(1).maxLength(254),
	description: vine.string().trim().maxLength(300).optional(),
	url: vine.string().normalizeUrl({ defaultProtocol: 'https' }).trim(),
	favorite: vine.boolean(),
	// May be empty — the service falls back to the user's Inbox collection so
	// a link is never left without a home (see LinkService.resolveCollectionIds).
	collectionIds: vine.array(vine.number()),
});
