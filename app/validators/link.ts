import vine from '@vinejs/vine';

const params = vine.object({
	id: vine.number(),
});

export const createLinkValidator = vine.compile(
	vine.object({
		name: vine.string().trim().minLength(1).maxLength(254),
		description: vine.string().trim().maxLength(300).optional(),
		url: vine.string().trim(),
		favorite: vine.boolean(),
		collectionId: vine.number(),
	})
);

export const updateLinkValidator = vine.compile(
	vine.object({
		name: vine.string().trim().minLength(1).maxLength(254),
		description: vine.string().trim().maxLength(300).optional(),
		url: vine.string().trim(),
		favorite: vine.boolean(),
		collectionId: vine.number(),

		params,
	})
);

export const deleteLinkValidator = vine.compile(
	vine.object({
		params,
	})
);

export const updateLinkFavoriteStatusValidator = vine.compile(
	vine.object({
		favorite: vine.boolean(),

		params: vine.object({
			id: vine.number(),
		}),
	})
);
