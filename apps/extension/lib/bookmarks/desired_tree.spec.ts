import { describe, expect, it } from 'vitest';

import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';
import { buildDesiredFolder } from '@/lib/bookmarks/desired_tree';

function buildLink(id: number, url: string): LinkResource {
	return {
		id,
		authorId: 1,
		collectionIds: [1],
		createdAt: '2026-01-01T00:00:00.000Z',
		name: `Link ${id}`,
		url,
		description: null,
		favorite: false,
		clicks: 0,
		lastClickedAt: null,
	};
}

function buildCollection(links: LinkResource[]): CollectionWithLinks {
	return {
		id: 1,
		authorId: 1,
		isOwner: true,
		isDefault: false,
		createdAt: '2026-01-01T00:00:00.000Z',
		name: 'Inbox',
		description: null,
		visibility: 'PRIVATE',
		icon: null,
		position: 0,
		links,
	};
}

describe('buildDesiredFolder', () => {
	it.each([
		'javascript:alert(document.cookie)',
		'data:text/html,<script>alert(1)</script>',
		'file:///etc/passwd',
		'chrome://settings',
		'not a url',
	])('should skip a link whose URL is %s', (unsafeUrl) => {
		const folder = buildDesiredFolder(
			buildCollection([buildLink(1, unsafeUrl)])
		);

		expect(folder.bookmarks).toEqual([]);
	});

	it('should keep http and https links and drop only the unsafe ones', () => {
		const folder = buildDesiredFolder(
			buildCollection([
				buildLink(1, 'https://secure.example.com'),
				buildLink(2, 'javascript:alert(1)'),
				buildLink(3, 'http://plain.example.com'),
			])
		);

		expect(folder.bookmarks.map((bookmark) => bookmark.linkId)).toEqual([1, 3]);
	});
});
