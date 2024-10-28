import vine from '@vinejs/vine';

export const searchTermValidator = vine.compile(
	vine.object({
		searchTerm: vine.string().trim().minLength(1).maxLength(255),
	})
);
