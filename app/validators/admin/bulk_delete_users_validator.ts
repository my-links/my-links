import vine from '@vinejs/vine';

export const bulkDeleteUsersValidator = vine.create(
	vine.object({
		userIds: vine.array(vine.number()).minLength(1).distinct(),
	})
);
