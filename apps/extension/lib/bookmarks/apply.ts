import { buildLinkKey } from '@/lib/bookmarks/desired_tree';
import { runWithConcurrencyLimit } from '@/lib/concurrency';
import type { BookmarkOperation } from '@/lib/bookmarks/diff';
import type { BookmarksApi } from '@/lib/bookmarks/bookmarks_api';
import {
	withMappedBookmark,
	withMappedFolder,
	withoutMappedBookmark,
	withoutMappedBookmarksOfCollection,
	withoutMappedFolder,
	type BookmarkMapping,
} from '@/lib/bookmarks/mapping';

export const MAX_CONCURRENT_BOOKMARK_WRITES = 4;

export type BookmarkApplyResult = {
	mapping: BookmarkMapping;
	failedOperationCount: number;
};

type MappingChange =
	| { kind: 'map-folder'; collectionId: number; nodeId: string }
	| { kind: 'map-bookmark'; linkKey: string; nodeId: string }
	| { kind: 'unmap-folder'; collectionId: number }
	| { kind: 'unmap-bookmark'; linkKey: string };

/**
 * Executes a diff against the native tree and returns the mapping that
 * results from it, plus how many operations failed.
 *
 * Operations touch disjoint nodes by construction, so they run through a
 * small concurrency window rather than one at a time. The mapping is folded
 * afterwards, sequentially, so the outcome doesn't depend on which task
 * happened to finish first.
 *
 * A failing operation is isolated rather than aborting the batch: nodes the
 * successful ones created are already in the tree, and losing their mapping
 * would leave them unclaimed — the next pass would then read them as
 * bookmarks the user added by hand and adopt them into duplicate links. The
 * caller persists this mapping and treats a non-zero failure count as a
 * failed pass, so the rest is retried under backoff.
 */
export async function applyBookmarkOperations(
	api: BookmarksApi,
	rootId: string,
	operations: BookmarkOperation[],
	mapping: BookmarkMapping
): Promise<BookmarkApplyResult> {
	const outcomes = await runWithConcurrencyLimit(
		operations.map(
			(operation) => () => settleOperation(api, rootId, operation)
		),
		MAX_CONCURRENT_BOOKMARK_WRITES
	);

	return {
		mapping: outcomes
			.flatMap((outcome) => outcome.changes)
			.reduce(applyMappingChange, mapping),
		failedOperationCount: outcomes.filter((outcome) => outcome.hasFailed)
			.length,
	};
}

async function settleOperation(
	api: BookmarksApi,
	rootId: string,
	operation: BookmarkOperation
): Promise<{ changes: MappingChange[]; hasFailed: boolean }> {
	try {
		return {
			changes: await applyOperation(api, rootId, operation),
			hasFailed: false,
		};
	} catch (error) {
		console.error(
			`MyLinks bookmark operation "${operation.kind}" failed`,
			error
		);
		return { changes: [], hasFailed: true };
	}
}

async function applyOperation(
	api: BookmarksApi,
	rootId: string,
	operation: BookmarkOperation
): Promise<MappingChange[]> {
	switch (operation.kind) {
		case 'create-folder':
			return await createFolder(api, rootId, operation);
		case 'rename-folder':
			await api.update(operation.nodeId, { title: operation.title });
			return [];
		case 'remove-folder':
			await api.removeTree(operation.nodeId);
			return [{ kind: 'unmap-folder', collectionId: operation.collectionId }];
		case 'create-bookmark':
			return await createBookmark(api, operation);
		case 'update-bookmark':
			await api.update(operation.nodeId, {
				title: operation.title,
				url: operation.url,
			});
			return [];
		case 'remove-bookmark':
			await api.remove(operation.nodeId);
			return [{ kind: 'unmap-bookmark', linkKey: operation.linkKey }];
		case 'forget-bookmark':
			return [{ kind: 'unmap-bookmark', linkKey: operation.linkKey }];
		case 'move-bookmark':
			await api.move(operation.nodeId, { parentId: operation.parentNodeId });
			return [];
		case 'reorder-pinned':
			await reorderPinned(api, operation);
			return [];
	}
}

async function createFolder(
	api: BookmarksApi,
	rootId: string,
	operation: Extract<BookmarkOperation, { kind: 'create-folder' }>
): Promise<MappingChange[]> {
	// Always directly under the root — the mirror is one folder deep, and
	// creating anywhere else would put writes outside the blast radius the
	// takeover established.
	const folder = await api.create({ parentId: rootId, title: operation.title });

	// Children go in sequentially so they land in the order the server lists
	// them; the browser appends, and racing the creates would shuffle them.
	const childChanges: MappingChange[] = [];
	for (const bookmark of operation.bookmarks) {
		const created = await api.create({
			parentId: folder.id,
			title: bookmark.title,
			url: bookmark.url,
		});
		childChanges.push({
			kind: 'map-bookmark',
			linkKey: buildLinkKey(operation.collectionId, bookmark.linkId),
			nodeId: created.id,
		});
	}

	return [
		{
			kind: 'map-folder',
			collectionId: operation.collectionId,
			nodeId: folder.id,
		},
		...childChanges,
	];
}

async function createBookmark(
	api: BookmarksApi,
	operation: Extract<BookmarkOperation, { kind: 'create-bookmark' }>
): Promise<MappingChange[]> {
	const created = await api.create({
		parentId: operation.parentNodeId,
		title: operation.title,
		url: operation.url,
	});

	return [
		{ kind: 'map-bookmark', linkKey: operation.linkKey, nodeId: created.id },
	];
}

/**
 * Sequential and in rank order: every move renumbers the siblings after it,
 * so placing node `n` only lands correctly once nodes `0..n-1` already sit
 * where they belong.
 */
async function reorderPinned(
	api: BookmarksApi,
	operation: Extract<BookmarkOperation, { kind: 'reorder-pinned' }>
): Promise<void> {
	for (const [index, nodeId] of operation.nodeIdsInOrder.entries()) {
		await api.move(nodeId, { parentId: operation.parentNodeId, index });
	}
}

function applyMappingChange(
	mapping: BookmarkMapping,
	change: MappingChange
): BookmarkMapping {
	switch (change.kind) {
		case 'map-folder':
			return withMappedFolder(mapping, change.collectionId, change.nodeId);
		case 'map-bookmark':
			return withMappedBookmark(mapping, change.linkKey, change.nodeId);
		case 'unmap-folder':
			return withoutMappedBookmarksOfCollection(
				withoutMappedFolder(mapping, change.collectionId),
				change.collectionId
			);
		case 'unmap-bookmark':
			return withoutMappedBookmark(mapping, change.linkKey);
	}
}
