import { describe, expect, it } from 'vitest';

import { applyBookmarkOperations } from '@/lib/bookmarks/apply';
import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import { FakeBookmarksApi } from '@/lib/bookmarks/fake_bookmarks_api';
import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';
import {
	buildFolderReorder,
	buildLinkReorder,
} from '@/lib/bookmarks/collection_order';

function buildLink(overrides: Partial<LinkResource> = {}): LinkResource {
	return {
		id: 1,
		authorId: 1,
		collectionIds: [1],
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		name: 'Example',
		url: 'https://example.com',
		description: null,
		favorite: false,
		clicks: 0,
		lastClickedAt: null,
		...overrides,
	};
}

function buildCollection(
	overrides: Partial<CollectionWithLinks> = {}
): CollectionWithLinks {
	return {
		id: 1,
		authorId: 1,
		isOwner: true,
		isDefault: false,
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		name: 'Work',
		description: null,
		visibility: 'PRIVATE',
		icon: null,
		position: 0,
		links: [],
		...overrides,
	};
}

const ROOT_ID = 'root';

function buildFolderNode(
	id: string,
	children: BookmarkNode[] = []
): BookmarkNode {
	return { id, parentId: ROOT_ID, title: id, children };
}

describe('buildFolderReorder', () => {
	it('should reorder the mapped folders to match the collections order', () => {
		const collections = [
			buildCollection({ id: 2 }),
			buildCollection({ id: 1 }),
		];
		const mapping = {
			folderIdByCollectionId: { '1': 'f1', '2': 'f2' },
			bookmarkIdByLinkKey: {},
		};

		const operations = buildFolderReorder(
			collections,
			ROOT_ID,
			[buildFolderNode('f1'), buildFolderNode('f2')],
			mapping
		);

		expect(operations).toEqual([
			{
				kind: 'reorder-children',
				parentNodeId: ROOT_ID,
				nodeIdsInOrder: ['f2', 'f1'],
			},
		]);
	});

	it('should emit nothing when folders already match', () => {
		const collections = [
			buildCollection({ id: 1 }),
			buildCollection({ id: 2 }),
		];
		const mapping = {
			folderIdByCollectionId: { '1': 'f1', '2': 'f2' },
			bookmarkIdByLinkKey: {},
		};

		const operations = buildFolderReorder(
			collections,
			ROOT_ID,
			[buildFolderNode('f1'), buildFolderNode('f2')],
			mapping
		);

		expect(operations).toEqual([]);
	});
});

describe('buildLinkReorder', () => {
	it("should reorder a collection's bookmarks to match its links order", () => {
		const collection = buildCollection({
			id: 1,
			links: [buildLink({ id: 20 }), buildLink({ id: 10 })],
		});
		const mapping = {
			folderIdByCollectionId: {},
			bookmarkIdByLinkKey: { '1:10': 'b10', '1:20': 'b20' },
		};

		const operations = buildLinkReorder(
			collection,
			'folder',
			[buildFolderNode('b10'), buildFolderNode('b20')],
			mapping
		);

		expect(operations).toEqual([
			{
				kind: 'reorder-children',
				parentNodeId: 'folder',
				nodeIdsInOrder: ['b20', 'b10'],
			},
		]);
	});
});

describe('collection and link order applied to a real tree', () => {
	it('should move folders and their bookmarks into position without recreating anything', async () => {
		const api = new FakeBookmarksApi();
		const rootId = api.createFolder(api.rootId, 'MyLinks');
		const workFolderId = api.createFolder(rootId, 'Work');
		const readingFolderId = api.createFolder(rootId, 'Reading');
		const firstBookmarkId = api.createLink(
			workFolderId,
			'First',
			'https://first.example.com'
		);
		const secondBookmarkId = api.createLink(
			workFolderId,
			'Second',
			'https://second.example.com'
		);

		const mapping = {
			folderIdByCollectionId: { '1': workFolderId, '2': readingFolderId },
			bookmarkIdByLinkKey: {
				'1:10': firstBookmarkId,
				'1:20': secondBookmarkId,
			},
		};

		// Server order puts Reading before Work, and link 20 before link 10.
		const collections = [
			buildCollection({ id: 2, name: 'Reading' }),
			buildCollection({
				id: 1,
				name: 'Work',
				links: [buildLink({ id: 20 }), buildLink({ id: 10 })],
			}),
		];

		async function childrenOf(id: string) {
			const [node] = await api.getSubTree(id);
			return node?.children ?? [];
		}

		const folderReorder = buildFolderReorder(
			collections,
			rootId,
			await childrenOf(rootId),
			mapping
		);
		const { mapping: afterFolderReorder } = await applyBookmarkOperations(
			api,
			rootId,
			folderReorder,
			mapping
		);

		const linkReorder = buildLinkReorder(
			collections[1],
			workFolderId,
			await childrenOf(workFolderId),
			afterFolderReorder
		);
		await applyBookmarkOperations(
			api,
			workFolderId,
			linkReorder,
			afterFolderReorder
		);

		expect((await childrenOf(rootId)).map((child) => child.title)).toEqual([
			'Reading',
			'Work',
		]);
		expect(
			(await childrenOf(workFolderId)).map((child) => child.title)
		).toEqual(['Second', 'First']);
	});
});
