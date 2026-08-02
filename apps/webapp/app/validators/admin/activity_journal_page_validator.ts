import vine from '@vinejs/vine';

/**
 * Which page of the journal to read. Absent means the first one, which is what
 * a link with no query string asks for.
 */
export const activityJournalPageValidator = vine.create(
	vine.object({
		page: vine.number().min(1).optional(),
	})
);
