import vine from '@vinejs/vine';

export const collectionIdValidator = vine.compile(
	vine.object({
		collectionId: vine.number().positive().optional(),
	})
);
