import vine from '@vinejs/vine';

/**
 * The route parameter carrying a single-use link's token. Validated like any
 * other boundary input so a controller reads a `string` instead of narrowing
 * an untyped params bag; whether the value matches a live token is
 * `OneTimeTokenService`'s answer to give.
 */
export const oneTimeTokenValidator = vine.create(
	vine.object({
		token: vine.string().trim().minLength(1),
	})
);
