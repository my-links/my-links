import { describe, expect, it } from 'vitest';

import { detectInboundChanges } from '@/lib/bookmarks/inbound';
import { EMPTY_BOOKMARK_MAPPING } from '@/lib/bookmarks/mapping';
import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';

function buildLink(overrides: Partial<LinkResource> = {}): LinkResource {
	return {
		id: 10,
		authorId: 1,
		collectionIds: [1],
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		name: 'Docs',
		url: 'https://docs.example.com',
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
		links: [buildLink()],
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

const WORK_FOLDER_MAPPING = {
	folderIdByCollectionId: { '1': 'f1' },
	bookmarkIdByLinkKey: { '1:10': 'b1' },
};

describe('detectInboundChanges', () => {
	it('should report nothing when the native tree matches the server', () => {
		const changes = detectInboundChanges(
			[buildCollection()],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'Docs', url: 'https://docs.example.com' },
				]),
			],
			WORK_FOLDER_MAPPING
		);

		expect(changes).toEqual([]);
	});

	it('should turn a bookmark the user dropped into a collection folder into a link', () => {
		const changes = detectInboundChanges(
			[buildCollection({ links: [] })],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'new', title: 'Recipe', url: 'https://recipe.example.com' },
				]),
			],
			{ folderIdByCollectionId: { '1': 'f1' }, bookmarkIdByLinkKey: {} }
		);

		expect(changes).toEqual([
			{
				kind: 'create-link',
				collectionId: 1,
				name: 'Recipe',
				url: 'https://recipe.example.com',
			},
		]);
	});

	it('should push a bookmark renamed in the browser back onto its link', () => {
		const changes = detectInboundChanges(
			[buildCollection()],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'Handbook', url: 'https://docs.example.com' },
				]),
			],
			WORK_FOLDER_MAPPING
		);

		expect(changes).toEqual([
			{
				kind: 'update-link',
				linkId: 10,
				name: 'Handbook',
				url: 'https://docs.example.com',
				description: null,
				favorite: false,
				collectionIds: [1],
			},
		]);
	});

	it('should drop the collection from a link whose bookmark was deleted', () => {
		const changes = detectInboundChanges(
			[buildCollection()],
			[buildFolderNode('f1', 'Work')],
			WORK_FOLDER_MAPPING
		);

		expect(changes).toEqual([
			expect.objectContaining({
				kind: 'update-link',
				linkId: 10,
				collectionIds: [],
			}),
		]);
	});

	it('should record a single membership change when a link is pulled from two folders at once', () => {
		const collections = [
			buildCollection({ links: [buildLink({ collectionIds: [1, 2] })] }),
			buildCollection({
				id: 2,
				name: 'Reading',
				links: [buildLink({ collectionIds: [1, 2] })],
			}),
		];

		const changes = detectInboundChanges(
			collections,
			[buildFolderNode('f1', 'Work'), buildFolderNode('f2', 'Reading')],
			{
				folderIdByCollectionId: { '1': 'f1', '2': 'f2' },
				bookmarkIdByLinkKey: { '1:10': 'b1', '2:10': 'b2' },
			}
		);

		expect(changes).toEqual([
			expect.objectContaining({
				kind: 'update-link',
				linkId: 10,
				collectionIds: [],
			}),
		]);
	});

	it('should read a bookmark dragged between folders as a move, not a duplicate', () => {
		const collections = [
			buildCollection({ links: [buildLink({ collectionIds: [1] })] }),
			buildCollection({ id: 2, name: 'Reading', links: [] }),
		];

		const changes = detectInboundChanges(
			collections,
			[
				buildFolderNode('f1', 'Work'),
				buildFolderNode('f2', 'Reading', [
					{ id: 'b1', title: 'Docs', url: 'https://docs.example.com' },
				]),
			],
			{
				folderIdByCollectionId: { '1': 'f1', '2': 'f2' },
				bookmarkIdByLinkKey: { '1:10': 'b1' },
			}
		);

		expect(changes).toEqual([
			expect.objectContaining({
				kind: 'update-link',
				linkId: 10,
				collectionIds: [2],
			}),
		]);
	});

	it('should keep memberships in collections that have no folder on screen', () => {
		const changes = detectInboundChanges(
			[buildCollection({ links: [buildLink({ collectionIds: [1, 99] })] })],
			[buildFolderNode('f1', 'Work')],
			WORK_FOLDER_MAPPING
		);

		expect(changes).toEqual([
			expect.objectContaining({ kind: 'update-link', collectionIds: [99] }),
		]);
	});

	it('should rename the collection when its folder is renamed in the browser', () => {
		const changes = detectInboundChanges(
			[buildCollection({ links: [] })],
			[buildFolderNode('f1', 'Job')],
			{ folderIdByCollectionId: { '1': 'f1' }, bookmarkIdByLinkKey: {} }
		);

		expect(changes).toEqual([
			{
				kind: 'rename-collection',
				collectionId: 1,
				name: 'Job',
				description: null,
				visibility: 'PRIVATE',
				icon: null,
			},
		]);
	});

	it('should not delete a collection whose folder disappeared', () => {
		const changes = detectInboundChanges([buildCollection({ links: [] })], [], {
			folderIdByCollectionId: { '1': 'f1' },
			bookmarkIdByLinkKey: {},
		});

		expect(changes).toEqual([]);
	});

	it('should ignore bookmarks outside any mapped collection folder', () => {
		const changes = detectInboundChanges(
			[buildCollection()],
			[
				buildFolderNode('backup', 'Backup 2026-07-24', [
					{ id: 'x', title: 'Old', url: 'https://old.example.com' },
				]),
			],
			EMPTY_BOOKMARK_MAPPING
		);

		expect(changes).toEqual([]);
	});
});
