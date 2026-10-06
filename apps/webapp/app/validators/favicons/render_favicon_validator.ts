import vine from '@vinejs/vine';

export const renderFaviconValidator = vine.create(
	vine.object({
		url: vine.string().optional(),
	})
);
