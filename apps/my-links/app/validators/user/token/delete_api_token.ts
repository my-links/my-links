import vine from '@vinejs/vine';

export const deleteApiTokenValidator = vine.create(
	vine.object({
		params: vine.object({
			tokenId: vine.string().trim().minLength(1).maxLength(255),
		}),
	})
);
