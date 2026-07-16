import vine from '@vinejs/vine';

export const deleteSessionValidator = vine.create(
	vine.object({
		params: vine.object({
			sessionId: vine.string().trim().minLength(1).maxLength(255),
		}),
	})
);
