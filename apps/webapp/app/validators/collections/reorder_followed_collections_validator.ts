import vine from '@vinejs/vine';

export const reorderFollowedCollectionsValidator = vine.create(
	vine.object({
		collectionIds: vine.array(vine.number().positive()).distinct().minLength(1),
	})
);
