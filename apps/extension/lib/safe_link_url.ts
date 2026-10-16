const SAFE_LINK_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:']);

/**
 * Link URLs come from the instance, which may be hostile: anything other
 * than a web URL (`javascript:` bookmarklets, `data:`, `file:`, `chrome:`)
 * must never reach a bookmark or an `href`.
 */
export function isSafeLinkUrl(url: string): boolean {
	try {
		return SAFE_LINK_PROTOCOLS.has(new URL(url).protocol);
	} catch {
		return false;
	}
}

/** `undefined` renders an anchor without `href`, i.e. plain non-clickable text. */
export function toSafeHref(url: string): string | undefined {
	return isSafeLinkUrl(url) ? url : undefined;
}
