import vine from '@vinejs/vine';

export const createApiTokenValidator = vine.compile(
	vine.object({
		name: vine.string().trim().minLength(1).maxLength(255),
		expiresAt: vine.date().optional(),
	})
);
