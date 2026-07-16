import vine from '@vinejs/vine';

export const searchValidator = vine.create(
	vine.object({
		term: vine.string().trim().minLength(1),
		type: vine.enum(['link', 'collection', 'both']).optional(),
	})
);
