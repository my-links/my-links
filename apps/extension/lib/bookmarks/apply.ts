import type { SyncedTree } from '@/lib/bookmarks/snapshot';
import { buildLinkKey } from '@/lib/bookmarks/desired_tree';
import { runWithConcurrencyLimit } from '@/lib/concurrency';
import type { BookmarksApi } from '@/lib/bookmarks/bookmarks_api';
import type { BookmarkOperation } from '@/lib/bookmarks/operations';
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
	/**
	 * Snapshot entries for the nodes this run created — the executor is the
	 * first to learn their ids, so the plan could not carry them.
	 */
	snapshot: SyncedTree;
	failedOperationCount: number;
};

type MappingChange =
	| { kind: 'map-folder'; collectionId: number; nodeId: string }
	| { kind: 'map-bookmark'; linkKey: string; nodeId: string }
	| { kind: 'unmap-folder'; collectionId: number }
	| { kind: 'unmap-bookmark'; linkKey: string };

type OperationOutcome = {
	changes: MappingChange[];
	snapshot: SyncedTree;
	hasFailed: boolean;
};

type OperationResult = Omit<OperationOutcome, 'hasFailed'>;

const NO_MAPPING_RESULT: OperationResult = { changes: [], snapshot: {} };

/**
 * Executes a plan against the native tree and returns the mapping and
 * snapshot entries that result from it, plus how many operations failed.
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
		mapping: applyMappingChanges(
			mapping,
			outcomes.flatMap((outcome) => outcome.changes)
		),
		snapshot: mergeSnapshots(outcomes.map((outcome) => outcome.snapshot)),
		failedOperationCount: outcomes.filter((outcome) => outcome.hasFailed)
			.length,
	};
}

/**
 * Every key is released before any key is claimed. Two nodes swapping
 * collections release and claim each other's key in the same run, and folding
 * one operation at a time would let the second release undo the first claim.
 */
function applyMappingChanges(
	mapping: BookmarkMapping,
	changes: MappingChange[]
): BookmarkMapping {
	return [
		...changes.filter(isMappingRelease),
		...changes.filter((change) => !isMappingRelease(change)),
	].reduce(applyMappingChange, mapping);
}

function isMappingRelease(change: MappingChange): boolean {
	return change.kind === 'unmap-folder' || change.kind === 'unmap-bookmark';
}

async function settleOperation(
	api: BookmarksApi,
	rootId: string,
	operation: BookmarkOperation
): Promise<OperationOutcome> {
	try {
		return {
			...(await applyOperation(api, rootId, operation)),
			hasFailed: false,
		};
	} catch (error) {
		console.error(
			`MyLinks bookmark operation "${operation.kind}" failed`,
			error
		);
		return { changes: [], snapshot: {}, hasFailed: true };
	}
}

async function applyOperation(
	api: BookmarksApi,
	rootId: string,
	operation: BookmarkOperation
): Promise<OperationResult> {
	switch (operation.kind) {
		case 'create-folder':
			return await createFolder(api, rootId, operation);
		case 'rename-folder':
			await api.update(operation.nodeId, { title: operation.title });
			return NO_MAPPING_RESULT;
		case 'remove-folder':
			await api.removeTree(operation.nodeId);
			return unmapFolder(operation.collectionId);
		case 'forget-folder':
			return unmapFolder(operation.collectionId);
		case 'create-bookmark':
			return await createBookmark(api, operation);
		case 'update-bookmark':
			await api.update(operation.nodeId, {
				title: operation.title,
				url: operation.url,
			});
			return NO_MAPPING_RESULT;
		case 'remove-bookmark':
			await api.remove(operation.nodeId);
			return unmapBookmark(operation.linkKey);
		case 'forget-bookmark':
			return unmapBookmark(operation.linkKey);
		case 'remap-bookmark':
			return {
				changes: [
					{ kind: 'unmap-bookmark', linkKey: operation.fromLinkKey },
					{
						kind: 'map-bookmark',
						linkKey: operation.toLinkKey,
						nodeId: operation.nodeId,
					},
				],
				snapshot: {},
			};
		case 'move-node':
			await api.move(operation.nodeId, { parentId: operation.parentNodeId });
			return NO_MAPPING_RESULT;
		case 'reorder-pinned':
			await reorderPinned(api, operation);
			return NO_MAPPING_RESULT;
	}
}

function unmapFolder(collectionId: number): OperationResult {
	return { changes: [{ kind: 'unmap-folder', collectionId }], snapshot: {} };
}

function unmapBookmark(linkKey: string): OperationResult {
	return { changes: [{ kind: 'unmap-bookmark', linkKey }], snapshot: {} };
}

async function createFolder(
	api: BookmarksApi,
	rootId: string,
	operation: Extract<BookmarkOperation, { kind: 'create-folder' }>
): Promise<OperationResult> {
	// Always directly under the root — the mirror is one folder deep, and
	// creating anywhere else would put writes outside the collections folder.
	const folder = await api.create({ parentId: rootId, title: operation.title });

	// Children go in sequentially so they land in the order the server lists
	// them; the browser appends, and racing the creates would shuffle them.
	const children: OperationResult[] = [];
	for (const bookmark of operation.bookmarks) {
		const created = await api.create({
			parentId: folder.id,
			title: bookmark.title,
			url: bookmark.url,
		});
		children.push({
			changes: [
				{
					kind: 'map-bookmark',
					linkKey: buildLinkKey(operation.collectionId, bookmark.linkId),
					nodeId: created.id,
				},
			],
			snapshot: {
				[created.id]: {
					parentId: folder.id,
					title: bookmark.title,
					url: bookmark.url,
				},
			},
		});
	}

	return {
		changes: [
			{
				kind: 'map-folder',
				collectionId: operation.collectionId,
				nodeId: folder.id,
			},
			...children.flatMap((child) => child.changes),
		],
		snapshot: mergeSnapshots([
			{ [folder.id]: { parentId: rootId, title: operation.title } },
			...children.map((child) => child.snapshot),
		]),
	};
}

async function createBookmark(
	api: BookmarksApi,
	operation: Extract<BookmarkOperation, { kind: 'create-bookmark' }>
): Promise<OperationResult> {
	const created = await api.create({
		parentId: operation.parentNodeId,
		title: operation.title,
		url: operation.url,
	});

	return {
		changes: [
			{ kind: 'map-bookmark', linkKey: operation.linkKey, nodeId: created.id },
		],
		snapshot: {
			[created.id]: {
				parentId: operation.parentNodeId,
				title: operation.title,
				url: operation.url,
			},
		},
	};
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

function mergeSnapshots(snapshots: SyncedTree[]): SyncedTree {
	return snapshots.reduce<SyncedTree>(
		(merged, snapshot) => ({ ...merged, ...snapshot }),
		{}
	);
}
