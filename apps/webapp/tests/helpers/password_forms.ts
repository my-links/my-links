/**
 * The body every "choose a password" form posts.
 *
 * Built by a function rather than inlined at each call site because VineJS'
 * `confirmed()` reads the confirmation field at runtime without adding it to
 * the validator's inferred input — so the generated route type describes a
 * body one field short of the real one.
 */
export function newPasswordForm(password: string) {
	return { password, passwordConfirmation: password };
}
