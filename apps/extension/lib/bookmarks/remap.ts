import { buildPinnedLinkKey } from '@/lib/bookmarks/pinned';
import { areSameBookmarkUrl } from '@/lib/bookmarks/url_match';
import { isFolder, type BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import {
	buildLinkKey,
	type DesiredBookmark,
	type DesiredFolder,
} from '@/lib/bookmarks/desired_tree';
import {
	getMappedBookmarkId,
	getMappedFolderId,
	withMappedBookmark,
	withMappedFolder,
	type BookmarkMapping,
} from '@/lib/bookmarks/mapping';

/**
 * Rebuilds mapping entries for nodes the mirror plainly created but can no
 * longer recognise.
 *
 * The mapping is the only thing tying a native node to a server entity, and
 * it does not survive the extension's storage being cleared — a reinstall, a
 * profile reset, or anything that forces a re-authentication. The bookmarks
 * themselves do survive, so without this every one of them reads as content
 * the user added by hand: the inbound pass adopts them into duplicate links
 * and the outbound pass builds a second set of folders beside the first.
 *
 * Recognition falls back to what the two sides actually share — a folder's
 * title, a bookmark's URL — and only ever claims nodes nothing else has
 * claimed. Matching the wrong same-named folder is harmless: the mapping
 * takes over from the next pass, and no node is created or destroyed here.
 */
export function remapOrphanedNodes(
	desiredFolders: DesiredFolder[],
	pinnedBookmarks: DesiredBookmark[],
	collectionsFolderChildren: BookmarkNode[],
	barChildren: BookmarkNode[],
	mapping: BookmarkMapping
): BookmarkMapping {
	const claimedNodeIds = new Set([
		...Object.values(mapping.folderIdByCollectionId),
		...Object.values(mapping.bookmarkIdByLinkKey),
	]);

	const withFolders = desiredFolders.reduce(
		(current, desiredFolder) =>
			remapFolder(
				desiredFolder,
				collectionsFolderChildren,
				claimedNodeIds,
				current
			),
		mapping
	);

	return remapPins(pinnedBookmarks, barChildren, claimedNodeIds, withFolders);
}

function remapFolder(
	desiredFolder: DesiredFolder,
	collectionsFolderChildren: BookmarkNode[],
	claimedNodeIds: Set<string>,
	mapping: BookmarkMapping
): BookmarkMapping {
	const folderNode = resolveFolderNode(
		desiredFolder,
		collectionsFolderChildren,
		claimedNodeIds,
		mapping
	);
	if (!folderNode) {
		return mapping;
	}

	const mappedFolder =
		getMappedFolderId(mapping, desiredFolder.collectionId) === folderNode.id
			? mapping
			: withMappedFolder(mapping, desiredFolder.collectionId, folderNode.id);

	return desiredFolder.bookmarks.reduce(
		(current, desiredBookmark) =>
			remapBookmark(
				buildLinkKey(desiredFolder.collectionId, desiredBookmark.linkId),
				desiredBookmark,
				folderNode.children ?? [],
				claimedNodeIds,
				current
			),
		mappedFolder
	);
}

/**
 * The folder already mapped when it still exists, otherwise an unclaimed one
 * carrying the collection's name.
 */
function resolveFolderNode(
	desiredFolder: DesiredFolder,
	collectionsFolderChildren: BookmarkNode[],
	claimedNodeIds: Set<string>,
	mapping: BookmarkMapping
): BookmarkNode | undefined {
	const mappedFolderId = getMappedFolderId(mapping, desiredFolder.collectionId);
	const mappedFolder = collectionsFolderChildren.find(
		(child) => child.id === mappedFolderId
	);
	if (mappedFolder) {
		return mappedFolder;
	}

	const matchingFolder = collectionsFolderChildren.find(
		(child) =>
			isFolder(child) &&
			child.title === desiredFolder.title &&
			!claimedNodeIds.has(child.id)
	);
	if (matchingFolder) {
		claimedNodeIds.add(matchingFolder.id);
	}
	return matchingFolder;
}

function remapBookmark(
	linkKey: string,
	desiredBookmark: DesiredBookmark,
	siblings: BookmarkNode[],
	claimedNodeIds: Set<string>,
	mapping: BookmarkMapping
): BookmarkMapping {
	const mappedNodeId = getMappedBookmarkId(mapping, linkKey);
	if (siblings.some((sibling) => sibling.id === mappedNodeId)) {
		return mapping;
	}

	const matchingNode = siblings.find(
		(sibling) =>
			areSameBookmarkUrl(sibling.url, desiredBookmark.url) &&
			!claimedNodeIds.has(sibling.id)
	);
	if (!matchingNode) {
		return mapping;
	}

	claimedNodeIds.add(matchingNode.id);
	return withMappedBookmark(mapping, linkKey, matchingNode.id);
}

function remapPins(
	pinnedBookmarks: DesiredBookmark[],
	barChildren: BookmarkNode[],
	claimedNodeIds: Set<string>,
	mapping: BookmarkMapping
): BookmarkMapping {
	return pinnedBookmarks.reduce(
		(current, pinnedBookmark) =>
			remapBookmark(
				buildPinnedLinkKey(pinnedBookmark.linkId),
				pinnedBookmark,
				barChildren,
				claimedNodeIds,
				current
			),
		mapping
	);
}
