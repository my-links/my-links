import vine from '@vinejs/vine';

export const params = vine.object({
	id: vine.number(),
});
