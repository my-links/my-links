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

type MappingChange =
	| { kind: 'map-folder'; collectionId: number; nodeId: string }
	| { kind: 'map-bookmark'; linkKey: string; nodeId: string }
	| { kind: 'unmap-folder'; collectionId: number }
	| { kind: 'unmap-bookmark'; linkKey: string };

/**
 * Executes a diff against the native tree and returns the mapping that
 * results from it.
 *
 * Operations touch disjoint nodes by construction, so they run through a
 * small concurrency window rather than one at a time. The mapping is folded
 * afterwards, sequentially, so the outcome doesn't depend on which task
 * happened to finish first.
 */
export async function applyBookmarkOperations(
	api: BookmarksApi,
	rootId: string,
	operations: BookmarkOperation[],
	mapping: BookmarkMapping
): Promise<BookmarkMapping> {
	const changesPerOperation = await runWithConcurrencyLimit(
		operations.map((operation) => () => applyOperation(api, rootId, operation)),
		MAX_CONCURRENT_BOOKMARK_WRITES
	);

	return changesPerOperation.flat().reduce(applyMappingChange, mapping);
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
			return [
				{
					kind: 'unmap-bookmark',
					linkKey: buildLinkKey(operation.collectionId, operation.linkId),
				},
			];
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
		{
			kind: 'map-bookmark',
			linkKey: buildLinkKey(operation.collectionId, operation.linkId),
			nodeId: created.id,
		},
	];
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
