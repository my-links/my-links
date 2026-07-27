/**
 * Routes that carry a single-use token in their path.
 *
 * The request logger runs as a server middleware, before routing, so there are
 * no route parameters to recognise a secret by — the prefixes are listed here
 * instead, and a new route that puts a token in its path has to join them.
 *
 * What this prevents: a debug log recording live confirmation and password
 * reset links, which hands account access to anyone who later reads the log
 * file. The tokens are single-use and short-lived, but a log is exactly the
 * artefact that gets shipped, archived and forgotten.
 */
const SECRET_BEARING_PATH_PREFIXES = [
	'/verify-email/',
	'/reset-password/',
] as const;

/**
 * Rewrites a request URL into the form it is safe to record.
 */
export function toLoggableUrl(url: string): string {
	const secretBearingPrefix = SECRET_BEARING_PATH_PREFIXES.find((prefix) =>
		url.startsWith(prefix)
	);

	return secretBearingPrefix ? `${secretBearingPrefix}[redacted]` : url;
}
