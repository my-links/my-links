import vine from '@vinejs/vine';

const MINIMUM_NICK_NAME_LENGTH = 2;
const MAXIMUM_NICK_NAME_LENGTH = 50;

/**
 * The name shown for this account everywhere — nav, collection attribution,
 * admin tables — reads `nickName` first, so renaming writes there rather
 * than to `name`, the value the account was originally opened under.
 */
export const renameAccountValidator = vine.create(
	vine.object({
		nickName: vine
			.string()
			.trim()
			.minLength(MINIMUM_NICK_NAME_LENGTH)
			.maxLength(MAXIMUM_NICK_NAME_LENGTH),
	})
);
