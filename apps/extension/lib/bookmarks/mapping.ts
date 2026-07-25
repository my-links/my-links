/**
 * Which native node stands for which server entity.
 *
 * This mapping is what makes the mirror safe: an operation is only ever
 * allowed to delete a node that appears in here, i.e. one MyLinks created
 * itself. The takeover's backup folder and anything the user files by hand
 * are never mapped, so no diff can ever propose removing them.
 */
export type BookmarkMapping = {
	folderIdByCollectionId: Record<string, string>;
	bookmarkIdByLinkKey: Record<string, string>;
	/**
	 * What each mapped node's title was when the mirror last left the tree in
	 * a settled state.
	 *
	 * Comparing a node against the server only says the two disagree, not
	 * which of them moved — and a link with a bookmark in a collection *and* a
	 * pin on the bar has two nodes that then take turns pushing their own
	 * title back, forever. Against this snapshot the question has an answer: a
	 * node that no longer matches it is one the user edited, and everything
	 * else is the server's to overwrite.
	 */
	titleByNodeId: Record<string, string>;
};

export const EMPTY_BOOKMARK_MAPPING: BookmarkMapping = {
	folderIdByCollectionId: {},
	bookmarkIdByLinkKey: {},
	titleByNodeId: {},
};

export function getMappedFolderId(
	mapping: BookmarkMapping,
	collectionId: number
): string | undefined {
	return mapping.folderIdByCollectionId[String(collectionId)];
}

export function getSnapshotTitle(
	mapping: BookmarkMapping,
	nodeId: string
): string | undefined {
	return mapping.titleByNodeId[nodeId];
}

/** Replaces the whole snapshot: nodes gone from the tree drop out with it. */
export function withNodeTitles(
	mapping: BookmarkMapping,
	titleByNodeId: Record<string, string>
): BookmarkMapping {
	return { ...mapping, titleByNodeId };
}

export function getMappedBookmarkId(
	mapping: BookmarkMapping,
	linkKey: string
): string | undefined {
	return mapping.bookmarkIdByLinkKey[linkKey];
}

export function withMappedFolder(
	mapping: BookmarkMapping,
	collectionId: number,
	nodeId: string
): BookmarkMapping {
	return {
		...mapping,
		folderIdByCollectionId: {
			...mapping.folderIdByCollectionId,
			[String(collectionId)]: nodeId,
		},
	};
}

export function withMappedBookmark(
	mapping: BookmarkMapping,
	linkKey: string,
	nodeId: string
): BookmarkMapping {
	return {
		...mapping,
		bookmarkIdByLinkKey: {
			...mapping.bookmarkIdByLinkKey,
			[linkKey]: nodeId,
		},
	};
}

export function withoutMappedFolder(
	mapping: BookmarkMapping,
	collectionId: number
): BookmarkMapping {
	return {
		...mapping,
		folderIdByCollectionId: withoutKey(
			mapping.folderIdByCollectionId,
			String(collectionId)
		),
	};
}

export function withoutMappedBookmark(
	mapping: BookmarkMapping,
	linkKey: string
): BookmarkMapping {
	return {
		...mapping,
		bookmarkIdByLinkKey: withoutKey(mapping.bookmarkIdByLinkKey, linkKey),
	};
}

/**
 * Drops every bookmark entry filed under a collection — used when a whole
 * mapped folder goes away, so its children don't linger as mappings pointing
 * at node ids the browser has already reclaimed.
 */
export function withoutMappedBookmarksOfCollection(
	mapping: BookmarkMapping,
	collectionId: number
): BookmarkMapping {
	const prefix = `${collectionId}:`;
	const remaining = Object.fromEntries(
		Object.entries(mapping.bookmarkIdByLinkKey).filter(
			([linkKey]) => !linkKey.startsWith(prefix)
		)
	);
	return { ...mapping, bookmarkIdByLinkKey: remaining };
}

/**
 * Written as an explicit filter rather than rest-destructuring with a
 * computed key: `oxlint --fix-dangerously` rewrites the destructured form
 * into a plain spread, which silently turns removal into a no-op.
 */
function withoutKey(
	entries: Record<string, string>,
	keyToDrop: string
): Record<string, string> {
	return Object.fromEntries(
		Object.entries(entries).filter(([key]) => key !== keyToDrop)
	);
}
