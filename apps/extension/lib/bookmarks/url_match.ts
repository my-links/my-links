/**
 * Compares a native bookmark URL with the one the server holds.
 *
 * The two normalise differently and neither will budge: the API runs every
 * URL through `normalizeUrl` (which drops a trailing slash on a bare origin),
 * while the browser adds one back when it stores the bookmark. Compared as
 * plain strings, `https://example.com` and `https://example.com/` look like a
 * user edit, so the mirror pushes the browser's form, the server rewrites it,
 * and the next pass sees the same difference again — forever.
 *
 * `URL.href` gives both forms the same shape, so a difference here means the
 * user really did change something.
 */
export function areSameBookmarkUrl(
	left: string | undefined,
	right: string | undefined
): boolean {
	if (left === right) {
		return true;
	}
	if (left === undefined || right === undefined) {
		return false;
	}
	return toComparableUrl(left) === toComparableUrl(right);
}

function toComparableUrl(url: string): string {
	try {
		return new URL(url).href;
	} catch {
		// Not something the browser can parse (a typo, a bookmarklet). Falling
		// back to the raw string keeps unequal values unequal rather than
		// silently declaring a match.
		return url;
	}
}
