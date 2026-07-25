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
	titleByNodeId: {},
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
			[],
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
			[],
			{
				folderIdByCollectionId: { '1': 'f1' },
				bookmarkIdByLinkKey: {},
				titleByNodeId: {},
			}
		);

		expect(changes).toEqual([
			{
				kind: 'create-link',
				nodeId: 'new',
				collectionId: 1,
				name: 'Recipe',
				url: 'https://recipe.example.com',
			},
		]);
	});

	it('should not read a URL the server normalised differently as a user edit', () => {
		// The user bookmarked https://www.google.com/ and the API stored
		// https://google.com — `normalizeUrl` strips `www.`. Neither side will
		// yield, so this must never be mistaken for an edit.
		const changes = detectInboundChanges(
			[
				buildCollection({
					links: [buildLink({ name: 'Google', url: 'https://google.com' })],
				}),
			],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'Google', url: 'https://www.google.com/' },
				]),
			],
			[],
			WORK_FOLDER_MAPPING
		);

		expect(changes).toEqual([]);
	});

	it('should push a rename while leaving the URL as the server holds it', () => {
		const changes = detectInboundChanges(
			[
				buildCollection({
					links: [buildLink({ name: 'Google', url: 'https://google.com' })],
				}),
			],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'My G', url: 'https://www.google.com/' },
				]),
			],
			[],
			WORK_FOLDER_MAPPING
		);

		expect(changes).toEqual([
			expect.objectContaining({
				kind: 'update-link',
				linkId: 10,
				name: 'My G',
				url: 'https://google.com',
			}),
		]);
	});

	it('should not read the browser adding a trailing slash as a user edit', () => {
		const changes = detectInboundChanges(
			[
				buildCollection({
					links: [buildLink({ url: 'https://example.com' })],
				}),
			],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'Docs', url: 'https://example.com/' },
				]),
			],
			[],
			WORK_FOLDER_MAPPING
		);

		expect(changes).toEqual([]);
	});

	it('should not try to strip a link out of its last collection', () => {
		const changes = detectInboundChanges(
			[buildCollection({ links: [buildLink({ collectionIds: [1] })] })],
			[buildFolderNode('f1', 'Work')],
			[],
			WORK_FOLDER_MAPPING
		);

		expect(changes).toEqual([]);
	});

	it('should stop adopting a bookmark once its new link is mapped', () => {
		const adoptedNode = {
			id: 'new',
			title: 'Recipe',
			url: 'https://recipe.example.com',
		};

		const changes = detectInboundChanges(
			[
				buildCollection({
					links: [
						buildLink({
							id: 99,
							name: 'Recipe',
							url: 'https://recipe.example.com',
						}),
					],
				}),
			],
			[buildFolderNode('f1', 'Work', [adoptedNode])],
			[],
			{
				folderIdByCollectionId: { '1': 'f1' },
				bookmarkIdByLinkKey: { '1:99': 'new' },
				titleByNodeId: {},
			}
		);

		expect(changes).toEqual([]);
	});

	it('should push a bookmark renamed in the browser back onto its link', () => {
		const changes = detectInboundChanges(
			[buildCollection()],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'Handbook', url: 'https://docs.example.com' },
				]),
			],
			[],
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
			[
				buildFolderNode('f1', 'Work'),
				buildFolderNode('f2', 'Reading', [
					{ id: 'b2', title: 'Docs', url: 'https://docs.example.com' },
				]),
			],
			[],
			{
				folderIdByCollectionId: { '1': 'f1', '2': 'f2' },
				bookmarkIdByLinkKey: { '1:10': 'b1', '2:10': 'b2' },
				titleByNodeId: {},
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

	it('should record a single membership change when a link is pulled from two folders at once', () => {
		// Also filed in collection 99, which has no folder on screen — that is
		// what keeps the link housed once both visible bookmarks are gone.
		const linkInThree = buildLink({ collectionIds: [1, 2, 99] });
		const collections = [
			buildCollection({ links: [linkInThree] }),
			buildCollection({ id: 2, name: 'Reading', links: [linkInThree] }),
		];

		const changes = detectInboundChanges(
			collections,
			[buildFolderNode('f1', 'Work'), buildFolderNode('f2', 'Reading')],
			[],
			{
				folderIdByCollectionId: { '1': 'f1', '2': 'f2' },
				bookmarkIdByLinkKey: { '1:10': 'b1', '2:10': 'b2' },
				titleByNodeId: {},
			}
		);

		expect(changes).toEqual([
			expect.objectContaining({
				kind: 'update-link',
				linkId: 10,
				collectionIds: [99],
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
			[],
			{
				folderIdByCollectionId: { '1': 'f1', '2': 'f2' },
				bookmarkIdByLinkKey: { '1:10': 'b1' },
				titleByNodeId: {},
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
			[],
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
			[],
			{
				folderIdByCollectionId: { '1': 'f1' },
				bookmarkIdByLinkKey: {},
				titleByNodeId: {},
			}
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
		const changes = detectInboundChanges(
			[buildCollection({ links: [] })],
			[],
			[],
			{
				folderIdByCollectionId: { '1': 'f1' },
				bookmarkIdByLinkKey: {},
				titleByNodeId: {},
			}
		);

		expect(changes).toEqual([]);
	});

	it('should unfavourite a link whose pin was deleted from the bar', () => {
		const changes = detectInboundChanges(
			[buildCollection({ links: [buildLink({ favorite: true })] })],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'Docs', url: 'https://docs.example.com' },
				]),
			],
			[],
			{
				folderIdByCollectionId: { '1': 'f1' },
				bookmarkIdByLinkKey: { '1:10': 'b1', 'pinned:10': 'p1' },
				titleByNodeId: {},
			}
		);

		expect(changes).toEqual([
			expect.objectContaining({
				kind: 'update-link',
				linkId: 10,
				favorite: false,
				collectionIds: [1],
			}),
		]);
	});

	it('should not unfavourite a pin that merely sits inside a folder', () => {
		const changes = detectInboundChanges(
			[buildCollection({ links: [buildLink({ favorite: true })] })],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'Docs', url: 'https://docs.example.com' },
				]),
			],
			[
				buildFolderNode('collections', 'Collections', [
					{ id: 'p1', title: 'Docs', url: 'https://docs.example.com' },
				]),
			],
			{
				folderIdByCollectionId: { '1': 'f1' },
				bookmarkIdByLinkKey: { '1:10': 'b1', 'pinned:10': 'p1' },
				titleByNodeId: {},
			}
		);

		expect(changes).toEqual([]);
	});

	it('should leave the favourite flag alone for a link the mirror never pinned', () => {
		const changes = detectInboundChanges(
			[buildCollection({ links: [buildLink({ favorite: true })] })],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'Docs', url: 'https://docs.example.com' },
				]),
			],
			[],
			WORK_FOLDER_MAPPING
		);

		expect(changes).toEqual([]);
	});

	it('should push a pin renamed on the bar back onto its link', () => {
		const changes = detectInboundChanges(
			[buildCollection({ links: [buildLink({ favorite: true })] })],
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: 'Docs', url: 'https://docs.example.com' },
				]),
			],
			[{ id: 'p1', title: 'Handbook', url: 'https://docs.example.com' }],
			{
				folderIdByCollectionId: { '1': 'f1' },
				bookmarkIdByLinkKey: { '1:10': 'b1', 'pinned:10': 'p1' },
				titleByNodeId: {},
			}
		);

		expect(changes).toEqual([
			expect.objectContaining({
				kind: 'update-link',
				linkId: 10,
				name: 'Handbook',
				favorite: true,
			}),
		]);
	});

	it('should ignore bookmarks outside any mapped collection folder', () => {
		const changes = detectInboundChanges(
			[buildCollection()],
			[
				buildFolderNode('backup', 'Backup 2026-07-24', [
					{ id: 'x', title: 'Old', url: 'https://old.example.com' },
				]),
			],
			[],
			EMPTY_BOOKMARK_MAPPING
		);

		expect(changes).toEqual([]);
	});
});

describe('detectInboundChanges — duplicate links', () => {
	const TWIN_MAPPING = {
		folderIdByCollectionId: { '1': 'f1' },
		bookmarkIdByLinkKey: { '1:2': 'b-one', '1:5': 'b-two' },
		titleByNodeId: {},
	};

	function buildTwinCollections() {
		return [
			buildCollection({
				links: [
					buildLink({ id: 2, name: 'Google', url: 'https://google.com' }),
					buildLink({ id: 5, name: 'Google', url: 'https://google.com' }),
				],
			}),
		];
	}

	it('should report nothing when both twins are mirrored', () => {
		const changes = detectInboundChanges(
			buildTwinCollections(),
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b-one', title: 'Google', url: 'https://google.com' },
					{ id: 'b-two', title: 'Google', url: 'https://google.com' },
				]),
			],
			[],
			TWIN_MAPPING
		);

		expect(changes).toEqual([]);
	});

	it('should rename only the twin whose own bookmark was renamed', () => {
		const changes = detectInboundChanges(
			buildTwinCollections(),
			[
				buildFolderNode('f1', 'Work', [
					{ id: 'b-one', title: 'Google', url: 'https://google.com' },
					{ id: 'b-two', title: 'My G', url: 'https://google.com' },
				]),
			],
			[],
			TWIN_MAPPING
		);

		expect(changes).toEqual([
			expect.objectContaining({ kind: 'update-link', linkId: 5, name: 'My G' }),
		]);
	});
});

describe('detectInboundChanges — settled snapshot', () => {
	const TWO_NODE_MAPPING = {
		folderIdByCollectionId: { '1': 'f1' },
		bookmarkIdByLinkKey: { '1:10': 'b1', 'pinned:10': 'p1' },
		titleByNodeId: { f1: 'Work', b1: 'Docs', p1: 'Docs' },
	};

	function buildTree(collectionTitle: string, pinTitle: string) {
		return {
			folderChildren: [
				buildFolderNode('f1', 'Work', [
					{ id: 'b1', title: collectionTitle, url: 'https://docs.example.com' },
				]),
			],
			barChildren: [
				{ id: 'p1', title: pinTitle, url: 'https://docs.example.com' },
			],
		};
	}

	it('should push the rename from the node the user actually edited', () => {
		const { folderChildren, barChildren } = buildTree('Docs', 'My D');

		const changes = detectInboundChanges(
			[buildCollection({ links: [buildLink({ favorite: true })] })],
			folderChildren,
			barChildren,
			TWO_NODE_MAPPING
		);

		expect(changes).toEqual([
			expect.objectContaining({ kind: 'update-link', name: 'My D' }),
		]);
	});

	it('should not let the stale sibling push the old name back once the rename landed', () => {
		// The pass that pushed "My D" settled each node at its own current
		// title, so the collection copy is merely out of date — the outbound
		// pass rewrites it, it does not get to argue.
		const { folderChildren, barChildren } = buildTree('Docs', 'My D');

		const changes = detectInboundChanges(
			[
				buildCollection({
					links: [buildLink({ name: 'My D', favorite: true })],
				}),
			],
			folderChildren,
			barChildren,
			{
				...TWO_NODE_MAPPING,
				titleByNodeId: { f1: 'Work', b1: 'Docs', p1: 'My D' },
			}
		);

		expect(changes).toEqual([]);
	});

	it('should not undo a collection renamed on the server', () => {
		const changes = detectInboundChanges(
			[buildCollection({ name: 'Job', links: [] })],
			[buildFolderNode('f1', 'Work')],
			[],
			{
				folderIdByCollectionId: { '1': 'f1' },
				bookmarkIdByLinkKey: {},
				titleByNodeId: { f1: 'Work' },
			}
		);

		expect(changes).toEqual([]);
	});
});
