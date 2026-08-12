import vine from '@vinejs/vine';

/**
 * Which page of the journal to read. Absent means the first one, which is what
 * a link with no query string asks for. Shared by the activity and the
 * authentication journal — both page the same way.
 */
export const journalPageValidator = vine.create(
	vine.object({
		page: vine.number().min(1).optional(),
	})
);
