import vine from '@vinejs/vine';

export const collectionIdValidator = vine.create(
	vine.object({
		collectionId: vine.number().positive().optional(),
	})
);
