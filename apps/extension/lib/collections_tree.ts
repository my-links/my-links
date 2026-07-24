import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';

const DEFAULT_COLLECTION_NAME = 'Inbox';

/**
 * Pure read/write helpers over the collections tree held in TanStack Query's
 * cache. Kept side-effect free so mutation hooks (`use_create_link.ts` and
 * friends) can use them for optimistic updates without touching storage or
 * the network — the background worker remains the only writer of
 * `collectionsCacheStorage` (see storage.ts).
 */

export function insertLinkIntoTree(
	collections: CollectionWithLinks[],
	link: LinkResource
): CollectionWithLinks[] {
	return collections.map((collection) =>
		link.collectionIds.includes(collection.id)
			? { ...collection, links: [...(collection.links ?? []), link] }
			: collection
	);
}

export function removeLinkFromTree(
	collections: CollectionWithLinks[],
	linkId: number
): CollectionWithLinks[] {
	return collections.map((collection) => ({
		...collection,
		links: (collection.links ?? []).filter((link) => link.id !== linkId),
	}));
}

export function replaceLinkInTree(
	collections: CollectionWithLinks[],
	linkId: number,
	nextLink: LinkResource
): CollectionWithLinks[] {
	return insertLinkIntoTree(removeLinkFromTree(collections, linkId), nextLink);
}

export function insertCollectionIntoTree(
	collections: CollectionWithLinks[],
	collection: CollectionWithLinks
): CollectionWithLinks[] {
	return [...collections, collection];
}

export function replaceCollectionInTree(
	collections: CollectionWithLinks[],
	collectionId: number,
	patch: Partial<CollectionWithLinks>
): CollectionWithLinks[] {
	return collections.map((collection) =>
		collection.id === collectionId ? { ...collection, ...patch } : collection
	);
}

export function removeCollectionFromTree(
	collections: CollectionWithLinks[],
	collectionId: number
): CollectionWithLinks[] {
	return collections.filter((collection) => collection.id !== collectionId);
}

export function findLinkByUrl(
	collections: CollectionWithLinks[],
	url: string
): LinkResource | undefined {
	return collections
		.flatMap((collection) => collection.links ?? [])
		.find((link) => link.url === url);
}

/**
 * The backend lazily creates a per-user "Inbox" collection on first
 * collection-less link (see `CollectionService.getOrCreateDefaultCollection`)
 * — it may not exist yet in a fresh account. Falls back to the first
 * collection so the create-link form always has a sane default, and to
 * `undefined` (omit `collectionId`, let the backend resolve it) only when no
 * collection exists at all yet.
 */
export function getDefaultCollectionId(
	collections: CollectionWithLinks[]
): number | undefined {
	return (
		collections.find(
			(collection) => collection.name === DEFAULT_COLLECTION_NAME
		)?.id ?? collections[0]?.id
	);
}
