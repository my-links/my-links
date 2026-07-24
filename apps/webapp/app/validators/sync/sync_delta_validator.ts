import vine from '@vinejs/vine';

export const syncDeltaValidator = vine.create(
	vine.object({
		since: vine.string().trim().optional(),
	})
);
