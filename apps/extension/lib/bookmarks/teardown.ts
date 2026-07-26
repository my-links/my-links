import { resolveBookmarksBarId } from '@/lib/bookmarks/root';
import type { BookmarkMapping } from '@/lib/bookmarks/mapping';
import { applyBookmarkOperations } from '@/lib/bookmarks/apply';
import { BOOKMARKS_PERMISSION } from '@/lib/bookmarks/constants';
import type { BookmarkOperation } from '@/lib/bookmarks/operations';
import {
	bookmarkMappingStorage,
	bookmarkMirrorStorage,
	clearBookmarkMirrorState,
} from '@/lib/storage';
import {
	getBrowserBookmarksApi,
	indexBySubtreeId,
	type BookmarkNode,
	type BookmarksApi,
} from '@/lib/bookmarks/bookmarks_api';

export class BookmarkTeardownError extends Error {}

export type MirrorTeardownPlan = {
	operations: BookmarkOperation[];
	/** Set only when the `Collections` folder is left holding nothing at all. */
	removableCollectionsFolderId: string | undefined;
};

/**
 * Works out how to hand the native tree back to the user.
 *
 * Obeys the same fence as every other plan: only nodes the mapping claims are
 * removed. A bookmark the user filed into a collection folder by hand keeps
 * that folder alive and stays exactly where they left it, and so does the
 * `Collections` folder itself.
 */
export function planMirrorTeardown(
	mapping: BookmarkMapping,
	collectionsFolderId: string | null,
	barChildren: BookmarkNode[]
): MirrorTeardownPlan {
	const nodesById = indexBySubtreeId(barChildren);
	const ownedNodeIds = new Set(Object.values(mapping.bookmarkIdByLinkKey));

	const folders = planFolderTeardown(mapping, nodesById, ownedNodeIds);
	const bookmarks = planBookmarkTeardown(
		mapping,
		nodesById,
		folders.removedNodeIds
	);

	return {
		operations: [...bookmarks.operations, ...folders.operations],
		removableCollectionsFolderId: resolveEmptiedFolderId(
			collectionsFolderId,
			nodesById,
			new Set([...folders.removedNodeIds, ...bookmarks.removedNodeIds])
		),
	};
}

type TeardownStep = {
	operations: BookmarkOperation[];
	removedNodeIds: Set<string>;
};

/**
 * A folder is taken down whole only when every child in it is one the mirror
 * created — `removeTree` would take the user's own bookmarks with it. A folder
 * holding anything else is simply forgotten and left to them, and the mirrored
 * bookmarks inside it are removed one by one.
 */
function planFolderTeardown(
	mapping: BookmarkMapping,
	nodesById: Map<string, BookmarkNode>,
	ownedNodeIds: Set<string>
): TeardownStep {
	const steps = Object.entries(mapping.folderIdByCollectionId).map(
		([collectionId, nodeId]) =>
			planFolder(
				Number(collectionId),
				nodeId,
				nodesById.get(nodeId),
				ownedNodeIds
			)
	);

	return {
		operations: steps.map((step) => step.operation),
		removedNodeIds: new Set(
			steps.flatMap((step) => (step.removedNodeId ? [step.removedNodeId] : []))
		),
	};
}

function planFolder(
	collectionId: number,
	nodeId: string,
	node: BookmarkNode | undefined,
	ownedNodeIds: Set<string>
): { operation: BookmarkOperation; removedNodeId: string | undefined } {
	const isEntirelyOurs =
		node !== undefined &&
		(node.children ?? []).every((child) => ownedNodeIds.has(child.id));

	if (!isEntirelyOurs) {
		return {
			operation: { kind: 'forget-folder', collectionId },
			removedNodeId: undefined,
		};
	}
	return {
		operation: { kind: 'remove-folder', nodeId, collectionId },
		removedNodeId: nodeId,
	};
}

/**
 * Bookmarks whose folder is going down whole are only forgotten: asking for
 * them again once `removeTree` has taken them would fail the teardown and
 * report leftovers that are not there.
 */
function planBookmarkTeardown(
	mapping: BookmarkMapping,
	nodesById: Map<string, BookmarkNode>,
	removedFolderNodeIds: Set<string>
): TeardownStep {
	const entries = Object.entries(mapping.bookmarkIdByLinkKey).map(
		([linkKey, nodeId]) => ({
			linkKey,
			nodeId,
			isRemovable: isRemovableBookmark(
				nodesById.get(nodeId),
				removedFolderNodeIds
			),
		})
	);

	return {
		operations: entries.map(({ linkKey, nodeId, isRemovable }) =>
			isRemovable
				? { kind: 'remove-bookmark', nodeId, linkKey }
				: { kind: 'forget-bookmark', linkKey }
		),
		removedNodeIds: new Set(
			entries.filter((entry) => entry.isRemovable).map((entry) => entry.nodeId)
		),
	};
}

function isRemovableBookmark(
	node: BookmarkNode | undefined,
	removedFolderNodeIds: Set<string>
): boolean {
	return node !== undefined && !removedFolderNodeIds.has(node.parentId ?? '');
}

/**
 * The `Collections` folder goes only when the teardown leaves it empty.
 * Anything still in it is the user's, and so is the folder from that point on.
 */
function resolveEmptiedFolderId(
	collectionsFolderId: string | null,
	nodesById: Map<string, BookmarkNode>,
	removedNodeIds: Set<string>
): string | undefined {
	if (!collectionsFolderId) {
		return undefined;
	}

	const folder = nodesById.get(collectionsFolderId);
	if (!folder) {
		return undefined;
	}

	const survivors = (folder.children ?? []).filter(
		(child) => !removedNodeIds.has(child.id)
	);
	return survivors.length === 0 ? collectionsFolderId : undefined;
}

/**
 * Stops mirroring and takes back every node the mirror created, leaving the
 * bar as close to its pre-MyLinks state as the mapping can prove.
 *
 * The alternative — backing the user's own bookmarks up and restoring them
 * later — was deliberately not built: an extension cannot run bookmark writes
 * on uninstall, so a user who removes it without disabling first would be left
 * with their bar locked inside a folder nothing is going to open again.
 */
export async function stopMirroringAndRemoveBookmarks(): Promise<void> {
	const mirrorState = await bookmarkMirrorStorage.getValue();
	// Parked before anything is removed: a pass landing mid-teardown would
	// otherwise re-create the very nodes being taken down.
	await bookmarkMirrorStorage.setValue({ ...mirrorState, isEnabled: false });

	const failedOperationCount = await removeMirroredNodes(mirrorState.rootId);
	await clearBookmarkMirrorState();

	if (failedOperationCount > 0) {
		throw new BookmarkTeardownError(
			`${failedOperationCount} bookmarks could not be removed and were left on the bar.`
		);
	}
}

async function removeMirroredNodes(
	collectionsFolderId: string | null
): Promise<number> {
	const hasPermission = await browser.permissions.contains({
		permissions: [BOOKMARKS_PERMISSION],
	});
	if (!hasPermission) {
		return 0;
	}

	const api = getBrowserBookmarksApi();
	const barId = await resolveBookmarksBarId(api);
	const [bar] = await api.getSubTree(barId);
	const mapping = await bookmarkMappingStorage.getValue();
	const plan = planMirrorTeardown(
		mapping,
		collectionsFolderId,
		bar?.children ?? []
	);

	// The bar stands in for the plan's root: a teardown creates nothing, and
	// that argument only ever names the parent of a folder being created.
	const { failedOperationCount } = await applyBookmarkOperations(
		api,
		barId,
		plan.operations,
		mapping
	);

	return (
		failedOperationCount +
		(await removeCollectionsFolder(api, plan.removableCollectionsFolderId))
	);
}

async function removeCollectionsFolder(
	api: BookmarksApi,
	folderId: string | undefined
): Promise<number> {
	if (!folderId) {
		return 0;
	}

	try {
		await api.removeTree(folderId);
		return 0;
	} catch (error) {
		console.error('MyLinks could not remove the Collections folder', error);
		return 1;
	}
}
