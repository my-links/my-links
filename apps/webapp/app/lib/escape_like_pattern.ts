const LIKE_WILDCARDS = /[\\%_]/g;

/**
 * Makes a user-typed term match literally inside a `LIKE`/`ILIKE` pattern,
 * where `%`, `_` and the escape character `\` would otherwise act as
 * wildcards.
 */
export function escapeLikePattern(term: string): string {
	return term.replace(LIKE_WILDCARDS, '\\$&');
}
