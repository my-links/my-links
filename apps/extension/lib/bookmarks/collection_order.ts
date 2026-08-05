import type { CollectionWithLinks } from '@/lib/api/types';
import { buildLinkKey } from '@/lib/bookmarks/desired_tree';
import { buildReorderOperation } from '@/lib/bookmarks/ordering';
import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import type { BookmarkOperation } from '@/lib/bookmarks/operations';
import {
	getMappedFolderId,
	getMappedBookmarkId,
	type BookmarkMapping,
} from '@/lib/bookmarks/mapping';

/**
 * Reorders the collection folders directly under the mirror's root folder to
 * match the server's `collections` order — the same array order the sidebar
 * already reflects, since `position` sorts it before it ever reaches here.
 */
export function buildFolderReorder(
	collections: CollectionWithLinks[],
	collectionsFolderId: string,
	collectionsFolderChildren: BookmarkNode[],
	mapping: BookmarkMapping
): BookmarkOperation[] {
	const desiredNodeIds = collections
		.map((collection) => getMappedFolderId(mapping, collection.id))
		.filter((nodeId): nodeId is string => nodeId !== undefined);

	return buildReorderOperation(
		desiredNodeIds,
		collectionsFolderId,
		collectionsFolderChildren
	);
}

/**
 * Reorders one collection folder's own bookmarks to match the server's
 * `links` order for that collection.
 */
export function buildLinkReorder(
	collection: CollectionWithLinks,
	folderNodeId: string,
	folderChildren: BookmarkNode[],
	mapping: BookmarkMapping
): BookmarkOperation[] {
	const desiredNodeIds = (collection.links ?? [])
		.map((link) =>
			getMappedBookmarkId(mapping, buildLinkKey(collection.id, link.id))
		)
		.filter((nodeId): nodeId is string => nodeId !== undefined);

	return buildReorderOperation(desiredNodeIds, folderNodeId, folderChildren);
}
