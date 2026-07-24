import { describe, expect, it } from 'vitest';

import { diffBookmarkTree } from '@/lib/bookmarks/diff';
import { applyBookmarkOperations } from '@/lib/bookmarks/apply';
import { EMPTY_BOOKMARK_MAPPING } from '@/lib/bookmarks/mapping';
import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import type { DesiredFolder } from '@/lib/bookmarks/desired_tree';
import { FakeBookmarksApi } from '@/lib/bookmarks/fake_bookmarks_api';

function buildDesiredFolder(
	overrides: Partial<DesiredFolder> = {}
): DesiredFolder {
	return {
		collectionId: 1,
		title: 'Work',
		bookmarks: [{ linkId: 10, title: 'Docs', url: 'https://docs.example.com' }],
		...overrides,
	};
}

function buildFolderNode(
	id: string,
	title: string,
	children: BookmarkNode[] = []
): BookmarkNode {
	return { id, title, children };
}

describe('diffBookmarkTree', () => {
	it('should create a folder carrying its bookmarks when the collection has no node yet', () => {
		const operations = diffBookmarkTree(
			[buildDesiredFolder()],
			[],
			EMPTY_BOOKMARK_MAPPING
		);

		expect(operations).toEqual([
			{
				kind: 'create-folder',
				collectionId: 1,
				title: 'Work',
				bookmarks: [
					{ linkId: 10, title: 'Docs', url: 'https://docs.example.com' },
				],
			},
		]);
	});

	it('should emit nothing when the native tree already matches the server', () => {
		const operations = diffBookmarkTree(
			[buildDesiredFolder()],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'Docs', url: 'https://docs.example.com' },
				]),
			],
			{
				folderIdByCollectionId: { '1': 'f1' },
				bookmarkIdByLinkKey: { '1:10': 'b1' },
			}
		);

		expect(operations).toEqual([]);
	});

	it('should rename a folder whose collection was renamed on the server', () => {
		const operations = diffBookmarkTree(
			[buildDesiredFolder({ title: 'Reading', bookmarks: [] })],
			[buildFolderNode('f1', 'Work')],
			{ folderIdByCollectionId: { '1': 'f1' }, bookmarkIdByLinkKey: {} }
		);

		expect(operations).toEqual([
			{ kind: 'rename-folder', nodeId: 'f1', title: 'Reading' },
		]);
	});

	it('should update a bookmark whose link was edited on the server', () => {
		const operations = diffBookmarkTree(
			[
				buildDesiredFolder({
					bookmarks: [
						{ linkId: 10, title: 'Handbook', url: 'https://docs.example.com' },
					],
				}),
			],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'Docs', url: 'https://docs.example.com' },
				]),
			],
			{
				folderIdByCollectionId: { '1': 'f1' },
				bookmarkIdByLinkKey: { '1:10': 'b1' },
			}
		);

		expect(operations).toEqual([
			{
				kind: 'update-bookmark',
				nodeId: 'b1',
				title: 'Handbook',
				url: 'https://docs.example.com',
			},
		]);
	});

	it('should remove a bookmark whose link left the collection', () => {
		const operations = diffBookmarkTree(
			[buildDesiredFolder({ bookmarks: [] })],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'Docs', url: 'https://docs.example.com' },
				]),
			],
			{
				folderIdByCollectionId: { '1': 'f1' },
				bookmarkIdByLinkKey: { '1:10': 'b1' },
			}
		);

		expect(operations).toEqual([
			{ kind: 'remove-bookmark', nodeId: 'b1', collectionId: 1, linkId: 10 },
		]);
	});

	it('should leave an unmapped bookmark alone instead of deleting what the user filed there', () => {
		const operations = diffBookmarkTree(
			[buildDesiredFolder({ bookmarks: [] })],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'user-added', title: 'Mine', url: 'https://mine.example.com' },
				]),
			],
			{ folderIdByCollectionId: { '1': 'f1' }, bookmarkIdByLinkKey: {} }
		);

		expect(operations).toEqual([]);
	});

	it('should never propose removing an unmapped folder such as the takeover backup', () => {
		const operations = diffBookmarkTree(
			[],
			[buildFolderNode('backup', 'Backup 2026-07-24')],
			EMPTY_BOOKMARK_MAPPING
		);

		expect(operations).toEqual([]);
	});

	it('should remove the folder of a collection deleted on the server', () => {
		const operations = diffBookmarkTree([], [buildFolderNode('f1', 'Work')], {
			folderIdByCollectionId: { '1': 'f1' },
			bookmarkIdByLinkKey: {},
		});

		expect(operations).toEqual([
			{ kind: 'remove-folder', nodeId: 'f1', collectionId: 1 },
		]);
	});

	it('should recreate a folder the user deleted by hand rather than dropping the collection', () => {
		const operations = diffBookmarkTree([buildDesiredFolder()], [], {
			folderIdByCollectionId: { '1': 'gone' },
			bookmarkIdByLinkKey: {},
		});

		expect(operations).toEqual([
			{
				kind: 'create-folder',
				collectionId: 1,
				title: 'Work',
				bookmarks: [
					{ linkId: 10, title: 'Docs', url: 'https://docs.example.com' },
				],
			},
		]);
	});
});

describe('applyBookmarkOperations', () => {
	async function childrenOf(api: FakeBookmarksApi, id: string) {
		const [node] = await api.getSubTree(id);
		return node?.children ?? [];
	}

	it('should build the folder and its bookmarks under the MyLinks root', async () => {
		const api = new FakeBookmarksApi();
		const rootId = api.createFolder(api.rootId, 'MyLinks');

		const mapping = await applyBookmarkOperations(
			api,
			rootId,
			diffBookmarkTree([buildDesiredFolder()], [], EMPTY_BOOKMARK_MAPPING),
			EMPTY_BOOKMARK_MAPPING
		);

		const [folder] = await childrenOf(api, rootId);
		expect(folder?.title).toBe('Work');
		expect(mapping.folderIdByCollectionId['1']).toBe(folder?.id);
		expect(folder?.children?.map((child) => child.url)).toEqual([
			'https://docs.example.com',
		]);
		expect(mapping.bookmarkIdByLinkKey['1:10']).toBe(folder?.children?.[0]?.id);
	});

	it('should forget the bookmarks of a folder it removed so no mapping points at a dead node', async () => {
		const api = new FakeBookmarksApi();
		const rootId = api.createFolder(api.rootId, 'MyLinks');
		const createdMapping = await applyBookmarkOperations(
			api,
			rootId,
			diffBookmarkTree([buildDesiredFolder()], [], EMPTY_BOOKMARK_MAPPING),
			EMPTY_BOOKMARK_MAPPING
		);

		const finalMapping = await applyBookmarkOperations(
			api,
			rootId,
			diffBookmarkTree([], await childrenOf(api, rootId), createdMapping),
			createdMapping
		);

		expect(finalMapping.folderIdByCollectionId).toEqual({});
		expect(finalMapping.bookmarkIdByLinkKey).toEqual({});
		expect(await childrenOf(api, rootId)).toEqual([]);
	});

	it('should converge in one pass — a second diff of the same state is empty', async () => {
		const api = new FakeBookmarksApi();
		const rootId = api.createFolder(api.rootId, 'MyLinks');
		const desiredFolders = [
			buildDesiredFolder(),
			buildDesiredFolder({
				collectionId: 2,
				title: 'Reading',
				bookmarks: [
					{ linkId: 20, title: 'Novel', url: 'https://novel.example.com' },
				],
			}),
		];

		const mapping = await applyBookmarkOperations(
			api,
			rootId,
			diffBookmarkTree(desiredFolders, [], EMPTY_BOOKMARK_MAPPING),
			EMPTY_BOOKMARK_MAPPING
		);

		expect(
			diffBookmarkTree(desiredFolders, await childrenOf(api, rootId), mapping)
		).toEqual([]);
	});
});
