import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';

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

/**
 * Splices `nextLink` in at its current index for every collection it was
 * already in, instead of dropping and re-appending it — a remove+insert would
 * shove an edited link to the bottom of its collection(s) on every save, even
 * when the edit never touched `collectionIds`. Only a collection newly gained
 * gets an append; only one newly lost gets the entry dropped.
 */
export function replaceLinkInTree(
	collections: CollectionWithLinks[],
	linkId: number,
	nextLink: LinkResource
): CollectionWithLinks[] {
	return collections.map((collection) => {
		const links = collection.links ?? [];
		const index = links.findIndex((link) => link.id === linkId);
		const belongs = nextLink.collectionIds.includes(collection.id);

		if (index === -1) {
			return belongs
				? { ...collection, links: [...links, nextLink] }
				: collection;
		}

		if (!belongs) {
			return {
				...collection,
				links: [...links.slice(0, index), ...links.slice(index + 1)],
			};
		}

		return {
			...collection,
			links: [...links.slice(0, index), nextLink, ...links.slice(index + 1)],
		};
	});
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
 * The Inbox is where a link with no explicit collection lands. Returns its id
 * so an optimistic update can place a collection-less link there instead of
 * nowhere (else it would vanish until the resync). Undefined when the Inbox
 * hasn't been created yet (fresh account) — the backend makes it on submit.
 */
export function getDefaultCollectionId(
	collections: CollectionWithLinks[]
): number | undefined {
	return collections.find((collection) => collection.isDefault)?.id;
}
