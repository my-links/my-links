import vine from '@vinejs/vine';

export const deleteApiTokenValidator = vine.compile(
	vine.object({
		params: vine.object({
			tokenId: vine.number().positive(),
		}),
	})
);
