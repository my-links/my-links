import { describe, expect, it } from 'vitest';

import { remapOrphanedNodes } from '@/lib/bookmarks/remap';
import type { BookmarkMapping } from '@/lib/bookmarks/mapping';
import { EMPTY_BOOKMARK_MAPPING } from '@/lib/bookmarks/mapping';
import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import type {
	DesiredBookmark,
	DesiredFolder,
} from '@/lib/bookmarks/desired_tree';

const INBOX: DesiredFolder = {
	collectionId: 1,
	title: 'Inbox',
	bookmarks: [{ linkId: 2, title: 'Google', url: 'https://google.com' }],
};

const GOOGLE_PIN: DesiredBookmark = {
	linkId: 2,
	title: 'Google',
	url: 'https://google.com',
};

function buildFolderNode(
	id: string,
	title: string,
	children: BookmarkNode[] = []
): BookmarkNode {
	return { id, title, children };
}

function recoverFolders(
	desiredFolders: DesiredFolder[],
	collectionsFolderChildren: BookmarkNode[],
	mapping: BookmarkMapping = EMPTY_BOOKMARK_MAPPING
): BookmarkMapping {
	return remapOrphanedNodes({
		desiredFolders,
		pinnedBookmarks: [],
		collectionsFolderChildren,
		barChildren: [],
		mapping,
		rootOrigin: 'adopted',
	});
}

function recoverPins(
	pinnedBookmarks: DesiredBookmark[],
	barChildren: BookmarkNode[],
	rootOrigin: 'created' | 'adopted' | null,
	mapping: BookmarkMapping = EMPTY_BOOKMARK_MAPPING
): BookmarkMapping {
	return remapOrphanedNodes({
		desiredFolders: [],
		pinnedBookmarks,
		collectionsFolderChildren: [],
		barChildren,
		mapping,
		rootOrigin,
	});
}

describe('remapOrphanedNodes — collection folders', () => {
	it('should claim back the folder and bookmark it created after storage was cleared', () => {
		const mapping = recoverFolders(
			[INBOX],
			[
				buildFolderNode('f-old', 'Inbox', [
					{ id: 'b-old', title: 'Google', url: 'https://google.com/' },
				]),
			]
		);

		expect(mapping.folderIdByCollectionId['1']).toBe('f-old');
		expect(mapping.bookmarkIdByLinkKey['1:2']).toBe('b-old');
	});

	it('should leave a mapping that still resolves untouched', () => {
		const existing = {
			folderIdByCollectionId: { '1': 'f1' },
			bookmarkIdByLinkKey: { '1:2': 'b1' },
		};

		const mapping = recoverFolders(
			[INBOX],
			[
				buildFolderNode('f1', 'Inbox', [
					{ id: 'b1', title: 'Google', url: 'https://google.com' },
				]),
			],
			existing
		);

		expect(mapping).toBe(existing);
	});

	it('should not claim a node another entity already owns', () => {
		const mapping = recoverFolders(
			[INBOX, { collectionId: 2, title: 'Inbox', bookmarks: [] }],
			[buildFolderNode('f-old', 'Inbox')]
		);

		expect(mapping.folderIdByCollectionId).toEqual({ '1': 'f-old' });
	});

	it('should leave a bookmark the user really added unclaimed', () => {
		const mapping = recoverFolders(
			[INBOX],
			[
				buildFolderNode('f-old', 'Inbox', [
					{ id: 'theirs', title: 'Mine', url: 'https://mine.example.com' },
				]),
			]
		);

		expect(mapping.bookmarkIdByLinkKey).toEqual({});
	});

	it('should recover a folder even before the mirror has a tree of its own', () => {
		const mapping = remapOrphanedNodes({
			desiredFolders: [INBOX],
			pinnedBookmarks: [],
			collectionsFolderChildren: [buildFolderNode('f-old', 'Inbox')],
			barChildren: [],
			mapping: EMPTY_BOOKMARK_MAPPING,
			rootOrigin: 'created',
		});

		expect(mapping.folderIdByCollectionId['1']).toBe('f-old');
	});
});

describe('remapOrphanedNodes — duplicate links', () => {
	const TWIN_LINKS: DesiredFolder = {
		collectionId: 1,
		title: 'Inbox',
		bookmarks: [
			{ linkId: 2, title: 'Google', url: 'https://google.com' },
			{ linkId: 5, title: 'Google', url: 'https://google.com' },
		],
	};

	it('should give two links sharing a URL a node each rather than both the same one', () => {
		const mapping = recoverFolders(
			[TWIN_LINKS],
			[
				buildFolderNode('f-old', 'Inbox', [
					{ id: 'b-one', title: 'Google', url: 'https://google.com' },
					{ id: 'b-two', title: 'Google', url: 'https://google.com' },
				]),
			]
		);

		expect(mapping.bookmarkIdByLinkKey['1:2']).toBe('b-one');
		expect(mapping.bookmarkIdByLinkKey['1:5']).toBe('b-two');
	});

	it('should leave the second twin unmapped rather than stealing the first one node', () => {
		const mapping = recoverFolders(
			[TWIN_LINKS],
			[
				buildFolderNode('f-old', 'Inbox', [
					{ id: 'b-one', title: 'Google', url: 'https://google.com' },
				]),
			]
		);

		expect(mapping.bookmarkIdByLinkKey['1:2']).toBe('b-one');
		expect(mapping.bookmarkIdByLinkKey['1:5']).toBeUndefined();
	});
});

describe('remapOrphanedNodes — pinned favourites', () => {
	it('should claim back a pin it left on the bar once it has a tree of its own', () => {
		const mapping = recoverPins(
			[GOOGLE_PIN],
			[{ id: 'p-old', title: 'Google', url: 'https://google.com/' }],
			'adopted'
		);

		expect(mapping.bookmarkIdByLinkKey['pinned:2']).toBe('p-old');
	});

	it('should leave a matching bar bookmark alone while the mirror has never written here', () => {
		const mapping = recoverPins(
			[GOOGLE_PIN],
			[{ id: 'theirs', title: 'Google', url: 'https://google.com/' }],
			'created'
		);

		expect(mapping.bookmarkIdByLinkKey['pinned:2']).toBeUndefined();
	});

	it('should leave a matching bar bookmark alone for a mirror enabled before origins were recorded', () => {
		const mapping = recoverPins(
			[GOOGLE_PIN],
			[{ id: 'theirs', title: 'Google', url: 'https://google.com/' }],
			null
		);

		expect(mapping.bookmarkIdByLinkKey['pinned:2']).toBeUndefined();
	});

	it('should not claim a node a collection already owns', () => {
		const mapping = recoverPins(
			[GOOGLE_PIN],
			[{ id: 'b1', title: 'Google', url: 'https://google.com' }],
			'adopted',
			{ folderIdByCollectionId: {}, bookmarkIdByLinkKey: { '1:2': 'b1' } }
		);

		expect(mapping.bookmarkIdByLinkKey['pinned:2']).toBeUndefined();
	});
});
