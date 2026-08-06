import type {
	CollectionVisibility,
	CollectionWithLinks,
	FollowedCollectionWithLinks,
	LinkResource,
} from '@/lib/api/types';

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

/**
 * Takes the already-final ordered id list (post-`arrayMove`, not a pair of
 * indices) — the server's `assertOwnedCollectionIds` requires the exact,
 * complete id set for the section on every reorder call, so there is no
 * partial-move variant to compute here, only a full assignment of
 * `0..n-1` to the matching visibility. Collections outside `visibility` are
 * left untouched.
 */
export function reorderCollectionsInTree(
	collections: CollectionWithLinks[],
	visibility: CollectionVisibility,
	collectionIds: number[]
): CollectionWithLinks[] {
	return collections.map((collection) => {
		if (collection.visibility !== visibility) {
			return collection;
		}
		const position = collectionIds.indexOf(collection.id);
		return position === -1 ? collection : { ...collection, position };
	});
}

/**
 * Followed collections carry no `position` field (see types.ts) — same
 * contract as `reorderLinksInTree`, the submitted id list already is the new
 * order, so reordering means resequencing the array to match it.
 */
export function reorderFollowedCollectionsInTree(
	collections: FollowedCollectionWithLinks[],
	collectionIds: number[]
): FollowedCollectionWithLinks[] {
	const collectionsById = new Map(
		collections.map((collection) => [collection.id, collection])
	);
	return collectionIds
		.map((collectionId) => collectionsById.get(collectionId))
		.filter(
			(collection): collection is FollowedCollectionWithLinks =>
				collection !== undefined
		);
}

export function removeCollectionFromTree(
	collections: CollectionWithLinks[],
	collectionId: number
): CollectionWithLinks[] {
	return collections.filter((collection) => collection.id !== collectionId);
}

/**
 * Links carry no pivot `position` field (unlike collections) — the array
 * order returned by the server already *is* the order, so reordering means
 * resequencing the matching collection's `links` array to the submitted id
 * list, same contract as `reorderCollectionLinks` on the server.
 */
export function reorderLinksInTree(
	collections: CollectionWithLinks[],
	collectionId: number,
	linkIds: number[]
): CollectionWithLinks[] {
	return collections.map((collection) => {
		if (collection.id !== collectionId) {
			return collection;
		}
		const linksById = new Map(
			(collection.links ?? []).map((link) => [link.id, link])
		);
		const reordered = linkIds
			.map((linkId) => linksById.get(linkId))
			.filter((link): link is LinkResource => link !== undefined);
		return { ...collection, links: reordered };
	});
}

/**
 * Detach from the source collection, attach to the target — mirrors the
 * server's move semantics, never duplicates the `links` row. Only the two
 * collections involved are patched; a third collection also holding this
 * link keeps a stale `collectionIds` until the resync that follows every
 * mutation (see `useCollectionsMutation`) corrects it.
 */
export function moveLinkBetweenCollectionsInTree(
	collections: CollectionWithLinks[],
	linkId: number,
	fromCollectionId: number,
	toCollectionId: number
): CollectionWithLinks[] {
	const sourceCollection = collections.find(
		(collection) => collection.id === fromCollectionId
	);
	const movedLink = sourceCollection?.links?.find((link) => link.id === linkId);
	if (!movedLink) {
		return collections;
	}

	const nextLink = {
		...movedLink,
		collectionIds: movedLink.collectionIds
			.filter((id) => id !== fromCollectionId)
			.concat(toCollectionId),
	};

	return collections.map((collection) => {
		if (collection.id === fromCollectionId) {
			return {
				...collection,
				links: (collection.links ?? []).filter((link) => link.id !== linkId),
			};
		}
		if (collection.id === toCollectionId) {
			return { ...collection, links: [...(collection.links ?? []), nextLink] };
		}
		return collection;
	});
}

/**
 * Shift+drop: attach to the target collection without detaching from the
 * source. Idempotent — a double drop (or a stale drag re-fired) must not
 * insert the link twice, matching the server's no-op-if-already-present rule.
 */
export function addLinkToCollectionInTree(
	collections: CollectionWithLinks[],
	linkId: number,
	collectionId: number
): CollectionWithLinks[] {
	const existingLink = collections
		.flatMap((collection) => collection.links ?? [])
		.find((link) => link.id === linkId);
	if (!existingLink) {
		return collections;
	}

	const targetCollection = collections.find(
		(collection) => collection.id === collectionId
	);
	const alreadyPresent =
		targetCollection?.links?.some((link) => link.id === linkId) ?? false;
	if (alreadyPresent) {
		return collections;
	}

	const nextLink = {
		...existingLink,
		collectionIds: existingLink.collectionIds.includes(collectionId)
			? existingLink.collectionIds
			: [...existingLink.collectionIds, collectionId],
	};

	return collections.map((collection) =>
		collection.id === collectionId
			? { ...collection, links: [...(collection.links ?? []), nextLink] }
			: collection
	);
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
