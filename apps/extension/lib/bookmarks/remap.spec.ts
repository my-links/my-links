import { describe, expect, it } from 'vitest';

import { remapOrphanedNodes } from '@/lib/bookmarks/remap';
import { EMPTY_BOOKMARK_MAPPING } from '@/lib/bookmarks/mapping';
import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import type { DesiredFolder } from '@/lib/bookmarks/desired_tree';

const INBOX: DesiredFolder = {
	collectionId: 1,
	title: 'Inbox',
	bookmarks: [{ linkId: 2, title: 'Google', url: 'https://google.com' }],
};

function buildFolderNode(
	id: string,
	title: string,
	children: BookmarkNode[] = []
): BookmarkNode {
	return { id, title, children };
}

describe('remapOrphanedNodes', () => {
	it('should claim back the folder and bookmark it created after storage was cleared', () => {
		const mapping = remapOrphanedNodes(
			[INBOX],
			[],
			[
				buildFolderNode('f-old', 'Inbox', [
					{ id: 'b-old', title: 'Google', url: 'https://google.com/' },
				]),
			],
			[],
			EMPTY_BOOKMARK_MAPPING
		);

		expect(mapping.folderIdByCollectionId['1']).toBe('f-old');
		expect(mapping.bookmarkIdByLinkKey['1:2']).toBe('b-old');
	});

	it('should claim back a pinned favourite on the bar by its URL', () => {
		const mapping = remapOrphanedNodes(
			[],
			[{ linkId: 2, title: 'Google', url: 'https://google.com' }],
			[],
			[{ id: 'p-old', title: 'Google', url: 'https://google.com/' }],
			EMPTY_BOOKMARK_MAPPING
		);

		expect(mapping.bookmarkIdByLinkKey['pinned:2']).toBe('p-old');
	});

	it('should leave a mapping that still resolves untouched', () => {
		const existing = {
			folderIdByCollectionId: { '1': 'f1' },
			bookmarkIdByLinkKey: { '1:2': 'b1' },
			titleByNodeId: {},
		};

		const mapping = remapOrphanedNodes(
			[INBOX],
			[],
			[
				buildFolderNode('f1', 'Inbox', [
					{ id: 'b1', title: 'Google', url: 'https://google.com' },
				]),
			],
			[],
			existing
		);

		expect(mapping).toBe(existing);
	});

	it('should not claim a node another entity already owns', () => {
		const mapping = remapOrphanedNodes(
			[
				INBOX,
				{
					collectionId: 2,
					title: 'Inbox',
					bookmarks: [],
				},
			],
			[],
			[buildFolderNode('f-old', 'Inbox')],
			[],
			EMPTY_BOOKMARK_MAPPING
		);

		expect(mapping.folderIdByCollectionId).toEqual({ '1': 'f-old' });
	});

	it('should leave a bookmark the user really added unclaimed', () => {
		const mapping = remapOrphanedNodes(
			[INBOX],
			[],
			[
				buildFolderNode('f-old', 'Inbox', [
					{ id: 'theirs', title: 'Mine', url: 'https://mine.example.com' },
				]),
			],
			[],
			EMPTY_BOOKMARK_MAPPING
		);

		expect(mapping.bookmarkIdByLinkKey).toEqual({});
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
		const mapping = remapOrphanedNodes(
			[TWIN_LINKS],
			[],
			[
				buildFolderNode('f-old', 'Inbox', [
					{ id: 'b-one', title: 'Google', url: 'https://google.com' },
					{ id: 'b-two', title: 'Google', url: 'https://google.com' },
				]),
			],
			[],
			EMPTY_BOOKMARK_MAPPING
		);

		expect(mapping.bookmarkIdByLinkKey['1:2']).toBe('b-one');
		expect(mapping.bookmarkIdByLinkKey['1:5']).toBe('b-two');
	});

	it('should leave the second twin unmapped rather than stealing the first one node', () => {
		const mapping = remapOrphanedNodes(
			[TWIN_LINKS],
			[],
			[
				buildFolderNode('f-old', 'Inbox', [
					{ id: 'b-one', title: 'Google', url: 'https://google.com' },
				]),
			],
			[],
			EMPTY_BOOKMARK_MAPPING
		);

		expect(mapping.bookmarkIdByLinkKey['1:2']).toBe('b-one');
		expect(mapping.bookmarkIdByLinkKey['1:5']).toBeUndefined();
	});
});
