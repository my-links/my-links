/**
 * URLs served by the configured MyLinks instance. Kept in one place so the
 * sidebar, the newtab page and the search panel can't drift apart on how
 * they address the same instance.
 */

export function buildFaviconUrl(
	instanceUrl: string,
	targetUrl: string
): string {
	return `${instanceUrl}/favicon?url=${encodeURIComponent(targetUrl)}`;
}

export function buildEmptyImageUrl(instanceUrl: string): string {
	return `${instanceUrl}/empty-image.png`;
}

export function buildCollectionUrl(
	instanceUrl: string,
	collectionId: number
): string {
	return `${instanceUrl}/collections/${collectionId}`;
}

/**
 * Opens a link through the instance's click-counting redirect instead of
 * jumping straight to the target, so a click from the extension feeds the
 * same ranking as one from the webapp.
 *
 * Native bookmarks deliberately do NOT go through this: a bookmark has to
 * keep working when the instance is unreachable, and it should show the
 * user the real destination.
 */
export function buildVisitUrl(instanceUrl: string, linkId: number): string {
	return `${instanceUrl}/l/${linkId}`;
}
