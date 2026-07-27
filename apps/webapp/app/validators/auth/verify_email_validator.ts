import vine from '@vinejs/vine';

/**
 * The route parameter carrying a confirmation link's token. Validated like any
 * other boundary input so the controller reads a `string` instead of narrowing
 * an untyped params bag; whether the value matches a live token is
 * `OneTimeTokenService`'s answer to give.
 */
export const verifyEmailValidator = vine.create(
	vine.object({
		token: vine.string().trim().minLength(1),
	})
);
