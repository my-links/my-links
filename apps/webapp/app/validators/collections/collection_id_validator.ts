import vine from '@vinejs/vine';

export const collectionIdValidator = vine.create(
	vine.object({
		params: vine.object({
			id: vine.number().positive(),
		}),
	})
);
