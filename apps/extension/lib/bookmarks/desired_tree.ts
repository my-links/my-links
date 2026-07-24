import type { CollectionWithLinks } from '@/lib/api/types';

export type DesiredBookmark = {
	linkId: number;
	title: string;
	url: string;
};

export type DesiredFolder = {
	collectionId: number;
	title: string;
	bookmarks: DesiredBookmark[];
};

/**
 * Flattens the server's collection tree into the shape the native bookmarks
 * tree can actually hold: one folder per collection, one bookmark per
 * (collection, link) pair.
 *
 * The duplication is the point — native bookmarks are single-parent, so a
 * link filed in three collections has to exist as three nodes. That is why
 * multi-collection support had to land before any of this.
 */
export function buildDesiredTree(
	collections: CollectionWithLinks[]
): DesiredFolder[] {
	return collections.map((collection) => ({
		collectionId: collection.id,
		title: collection.name,
		bookmarks: (collection.links ?? []).map((link) => ({
			linkId: link.id,
			title: link.name,
			url: link.url,
		})),
	}));
}

/**
 * Native nodes are tracked per (collection, link) pair, so the same link in
 * two collections keeps two independent mappings.
 */
export function buildLinkKey(collectionId: number, linkId: number): string {
	return `${collectionId}:${linkId}`;
}

export function parseLinkKey(
	linkKey: string
): { collectionId: number; linkId: number } | undefined {
	const [collectionId, linkId] = linkKey.split(':').map(Number);

	if (!Number.isInteger(collectionId) || !Number.isInteger(linkId)) {
		return undefined;
	}
	return { collectionId, linkId };
}
