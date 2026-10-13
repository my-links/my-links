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
