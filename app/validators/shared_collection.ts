import vine from '@vinejs/vine';

const params = vine.object({
	id: vine.number(),
});

export const getSharedCollectionValidator = vine.compile(
	vine.object({
		params,
	})
);
