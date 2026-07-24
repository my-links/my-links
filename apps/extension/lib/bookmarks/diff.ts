import { isFolder, type BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import {
	buildLinkKey,
	type DesiredBookmark,
	type DesiredFolder,
} from '@/lib/bookmarks/desired_tree';
import {
	getMappedBookmarkId,
	getMappedFolderId,
	type BookmarkMapping,
} from '@/lib/bookmarks/mapping';

export type BookmarkOperation =
	| {
			kind: 'create-folder';
			collectionId: number;
			title: string;
			bookmarks: DesiredBookmark[];
	  }
	| { kind: 'rename-folder'; nodeId: string; title: string }
	| { kind: 'remove-folder'; nodeId: string; collectionId: number }
	| {
			kind: 'create-bookmark';
			parentNodeId: string;
			collectionId: number;
			linkId: number;
			title: string;
			url: string;
	  }
	| { kind: 'update-bookmark'; nodeId: string; title: string; url: string }
	| {
			kind: 'remove-bookmark';
			nodeId: string;
			collectionId: number;
			linkId: number;
	  };

/**
 * Compares what the server says the tree should look like against what is
 * actually under the MyLinks root, and returns the smallest set of native
 * writes that closes the gap.
 *
 * There is deliberately no "rebuild everything" path: the previous extension
 * dropped and recreated the whole tree on every event, which is what froze
 * the browser. Nothing here touches a node the mapping doesn't claim, so
 * user-owned bookmarks living under the root (including the takeover backup)
 * are invisible to it.
 *
 * A brand-new folder carries its bookmarks with it rather than emitting
 * separate create operations: the parent's node id only exists once the
 * folder has actually been created, which a pure diff cannot know.
 */
export function diffBookmarkTree(
	desiredFolders: DesiredFolder[],
	rootChildren: BookmarkNode[],
	mapping: BookmarkMapping
): BookmarkOperation[] {
	const actualNodesById = indexById(rootChildren);

	const folderOperations = desiredFolders.flatMap((desiredFolder) =>
		diffFolder(desiredFolder, actualNodesById, mapping)
	);

	return [
		...folderOperations,
		...findRemovedFolders(desiredFolders, actualNodesById, mapping),
	];
}

function diffFolder(
	desiredFolder: DesiredFolder,
	actualNodesById: Map<string, BookmarkNode>,
	mapping: BookmarkMapping
): BookmarkOperation[] {
	const mappedFolderId = getMappedFolderId(mapping, desiredFolder.collectionId);
	const actualFolder = mappedFolderId
		? actualNodesById.get(mappedFolderId)
		: undefined;

	if (!actualFolder || !isFolder(actualFolder)) {
		return [
			{
				kind: 'create-folder',
				collectionId: desiredFolder.collectionId,
				title: desiredFolder.title,
				bookmarks: desiredFolder.bookmarks,
			},
		];
	}

	const renameOperations: BookmarkOperation[] =
		actualFolder.title === desiredFolder.title
			? []
			: [
					{
						kind: 'rename-folder',
						nodeId: actualFolder.id,
						title: desiredFolder.title,
					},
				];

	return [
		...renameOperations,
		...diffBookmarksOfFolder(desiredFolder, actualFolder, mapping),
	];
}

function diffBookmarksOfFolder(
	desiredFolder: DesiredFolder,
	actualFolder: BookmarkNode,
	mapping: BookmarkMapping
): BookmarkOperation[] {
	const actualChildrenById = indexById(actualFolder.children ?? []);
	const claimedNodeIds = new Set<string>();

	const upserts = desiredFolder.bookmarks.flatMap(
		(desiredBookmark): BookmarkOperation[] => {
			const linkKey = buildLinkKey(
				desiredFolder.collectionId,
				desiredBookmark.linkId
			);
			const mappedNodeId = getMappedBookmarkId(mapping, linkKey);
			const actualBookmark = mappedNodeId
				? actualChildrenById.get(mappedNodeId)
				: undefined;

			if (!actualBookmark) {
				return [
					{
						kind: 'create-bookmark',
						parentNodeId: actualFolder.id,
						collectionId: desiredFolder.collectionId,
						linkId: desiredBookmark.linkId,
						title: desiredBookmark.title,
						url: desiredBookmark.url,
					},
				];
			}

			claimedNodeIds.add(actualBookmark.id);

			if (
				actualBookmark.title === desiredBookmark.title &&
				actualBookmark.url === desiredBookmark.url
			) {
				return [];
			}

			return [
				{
					kind: 'update-bookmark',
					nodeId: actualBookmark.id,
					title: desiredBookmark.title,
					url: desiredBookmark.url,
				},
			];
		}
	);

	return [
		...upserts,
		...findRemovedBookmarks(
			desiredFolder.collectionId,
			actualFolder,
			claimedNodeIds,
			mapping
		),
	];
}

/**
 * Only nodes the mapping still claims are candidates for removal. Anything
 * else under a collection folder was put there by the user; the inbound pass
 * adopts it into the collection instead of deleting it.
 */
function findRemovedBookmarks(
	collectionId: number,
	actualFolder: BookmarkNode,
	claimedNodeIds: Set<string>,
	mapping: BookmarkMapping
): BookmarkOperation[] {
	const linkIdByNodeId = new Map(
		Object.entries(mapping.bookmarkIdByLinkKey)
			.filter(([linkKey]) => linkKey.startsWith(`${collectionId}:`))
			.map(([linkKey, nodeId]) => [nodeId, Number(linkKey.split(':')[1])])
	);

	return (actualFolder.children ?? [])
		.filter(
			(child) => !claimedNodeIds.has(child.id) && linkIdByNodeId.has(child.id)
		)
		.map(
			(child): BookmarkOperation => ({
				kind: 'remove-bookmark',
				nodeId: child.id,
				collectionId,
				linkId: linkIdByNodeId.get(child.id) ?? 0,
			})
		);
}

function findRemovedFolders(
	desiredFolders: DesiredFolder[],
	actualNodesById: Map<string, BookmarkNode>,
	mapping: BookmarkMapping
): BookmarkOperation[] {
	const desiredCollectionIds = new Set(
		desiredFolders.map((folder) => folder.collectionId)
	);

	return Object.entries(mapping.folderIdByCollectionId)
		.filter(([collectionId]) => !desiredCollectionIds.has(Number(collectionId)))
		.filter(([, nodeId]) => actualNodesById.has(nodeId))
		.map(
			([collectionId, nodeId]): BookmarkOperation => ({
				kind: 'remove-folder',
				nodeId,
				collectionId: Number(collectionId),
			})
		);
}

function indexById(nodes: BookmarkNode[]): Map<string, BookmarkNode> {
	return new Map(nodes.map((node) => [node.id, node]));
}
