import vine from '@vinejs/vine';

export const deleteSessionValidator = vine.create(
	vine.object({
		params: vine.object({
			publicId: vine.string().trim().uuid(),
		}),
	})
);
