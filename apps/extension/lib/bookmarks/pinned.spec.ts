import { describe, expect, it } from 'vitest';

import { applyBookmarkOperations } from '@/lib/bookmarks/apply';
import { EMPTY_BOOKMARK_MAPPING } from '@/lib/bookmarks/mapping';
import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import { FakeBookmarksApi } from '@/lib/bookmarks/fake_bookmarks_api';
import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';
import {
	buildPinnedLinkKey,
	collectFavoriteLinks,
	diffPinnedFavorites,
	EMPTY_PINNED_RANKING,
	RANKING_REFRESH_INTERVAL_MS,
	resolveRankedFavorites,
	shouldRecomputeRanking,
} from '@/lib/bookmarks/pinned';

const NOW = 1_800_000_000_000;

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
		favorite: true,
		clicks: 0,
		lastClickedAt: null,
		...overrides,
	};
}

function buildCollection(links: LinkResource[]): CollectionWithLinks {
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
		links,
	};
}

function buildBookmarkNode(
	id: string,
	title: string,
	url: string
): BookmarkNode {
	return { id, title, url };
}

describe('collectFavoriteLinks', () => {
	it('should keep only favourites', () => {
		const favorites = collectFavoriteLinks([
			buildCollection([
				buildLink({ id: 1, favorite: true }),
				buildLink({ id: 2, favorite: false }),
			]),
		]);

		expect(favorites.map((link) => link.id)).toEqual([1]);
	});

	it('should list a favourite once even when it sits in several collections', () => {
		const shared = buildLink({ id: 1, collectionIds: [1, 2] });

		const favorites = collectFavoriteLinks([
			buildCollection([shared]),
			{ ...buildCollection([shared]), id: 2, name: 'Reading' },
		]);

		expect(favorites).toHaveLength(1);
	});
});

describe('shouldRecomputeRanking', () => {
	it('should recompute as soon as a link is added to the favourites', () => {
		const ranking = { rankedLinkIds: [1], computedAt: NOW };

		expect(shouldRecomputeRanking(ranking, [1, 2], NOW)).toBe(true);
	});

	it('should recompute once the ranking is a day old', () => {
		const ranking = { rankedLinkIds: [1], computedAt: NOW };

		expect(
			shouldRecomputeRanking(ranking, [1], NOW + RANKING_REFRESH_INTERVAL_MS)
		).toBe(true);
	});

	it('should leave a fresh ranking alone so clicks never reshuffle the bar', () => {
		const ranking = { rankedLinkIds: [1, 2], computedAt: NOW };

		expect(shouldRecomputeRanking(ranking, [2, 1], NOW + 60_000)).toBe(false);
	});
});

describe('resolveRankedFavorites', () => {
	it('should rank the most clicked favourite first', () => {
		const { bookmarks, ranking } = resolveRankedFavorites(
			[
				buildLink({ id: 1, name: 'Rarely', clicks: 2 }),
				buildLink({ id: 2, name: 'Often', clicks: 40 }),
			],
			EMPTY_PINNED_RANKING,
			NOW
		);

		expect(bookmarks.map((bookmark) => bookmark.linkId)).toEqual([2, 1]);
		expect(ranking).toEqual({ rankedLinkIds: [2, 1], computedAt: NOW });
	});

	it('should keep a fresh ranking even after the click counts changed', () => {
		const ranking = { rankedLinkIds: [1, 2], computedAt: NOW };

		const resolved = resolveRankedFavorites(
			[
				buildLink({ id: 2, name: 'Often', clicks: 500 }),
				buildLink({ id: 1, name: 'Rarely', clicks: 1 }),
			],
			ranking,
			NOW + 60_000
		);

		expect(resolved.bookmarks.map((bookmark) => bookmark.linkId)).toEqual([
			1, 2,
		]);
		expect(resolved.ranking).toEqual(ranking);
	});
});

describe('diffPinnedFavorites', () => {
	const rootId = 'root';

	it('should pin a favourite directly under the MyLinks root', () => {
		const operations = diffPinnedFavorites(
			[{ linkId: 10, title: 'Docs', url: 'https://docs.example.com' }],
			rootId,
			[],
			EMPTY_BOOKMARK_MAPPING
		);

		expect(operations).toEqual([
			{
				kind: 'create-bookmark',
				parentNodeId: rootId,
				linkKey: 'pinned:10',
				title: 'Docs',
				url: 'https://docs.example.com',
			},
		]);
	});

	it('should unpin a link that stopped being a favourite', () => {
		const operations = diffPinnedFavorites(
			[],
			rootId,
			[buildBookmarkNode('p1', 'Docs', 'https://docs.example.com')],
			{
				folderIdByCollectionId: {},
				bookmarkIdByLinkKey: { 'pinned:10': 'p1' },
			}
		);

		expect(operations).toEqual([
			{ kind: 'remove-bookmark', nodeId: 'p1', linkKey: 'pinned:10' },
		]);
	});

	it('should leave the collection copy of a favourite untouched', () => {
		const operations = diffPinnedFavorites(
			[],
			rootId,
			[buildBookmarkNode('b1', 'Docs', 'https://docs.example.com')],
			{ folderIdByCollectionId: {}, bookmarkIdByLinkKey: { '1:10': 'b1' } }
		);

		expect(operations).toEqual([]);
	});

	it('should emit nothing when the pins already match the ranking', () => {
		const operations = diffPinnedFavorites(
			[
				{ linkId: 10, title: 'Docs', url: 'https://docs.example.com' },
				{ linkId: 20, title: 'News', url: 'https://news.example.com' },
			],
			rootId,
			[
				buildBookmarkNode('p1', 'Docs', 'https://docs.example.com'),
				buildBookmarkNode('p2', 'News', 'https://news.example.com'),
			],
			{
				folderIdByCollectionId: {},
				bookmarkIdByLinkKey: { 'pinned:10': 'p1', 'pinned:20': 'p2' },
			}
		);

		expect(operations).toEqual([]);
	});

	it('should reorder the pins in one operation when the ranking changed', () => {
		const operations = diffPinnedFavorites(
			[
				{ linkId: 20, title: 'News', url: 'https://news.example.com' },
				{ linkId: 10, title: 'Docs', url: 'https://docs.example.com' },
			],
			rootId,
			[
				buildBookmarkNode('p1', 'Docs', 'https://docs.example.com'),
				buildBookmarkNode('p2', 'News', 'https://news.example.com'),
			],
			{
				folderIdByCollectionId: {},
				bookmarkIdByLinkKey: { 'pinned:10': 'p1', 'pinned:20': 'p2' },
			}
		);

		expect(operations).toEqual([
			{
				kind: 'reorder-pinned',
				parentNodeId: rootId,
				nodeIdsInOrder: ['p2', 'p1'],
			},
		]);
	});
});

describe('pinned favourites applied to a real tree', () => {
	async function childrenOf(api: FakeBookmarksApi, id: string) {
		const [node] = await api.getSubTree(id);
		return node?.children ?? [];
	}

	it('should end up with the pins in ranking order and converge on the next pass', async () => {
		const api = new FakeBookmarksApi();
		const rootId = api.createFolder(api.rootId, 'MyLinks');
		const desiredPins = [
			{ linkId: 20, title: 'News', url: 'https://news.example.com' },
			{ linkId: 10, title: 'Docs', url: 'https://docs.example.com' },
		];

		const created = await applyBookmarkOperations(
			api,
			rootId,
			diffPinnedFavorites(desiredPins, rootId, [], EMPTY_BOOKMARK_MAPPING),
			EMPTY_BOOKMARK_MAPPING
		);

		// Reversing the ranking must reshuffle the existing nodes, not recreate
		// them — the mapping is what proves nothing was thrown away.
		const reversedPins = [...desiredPins].reverse();
		const reorderOperations = diffPinnedFavorites(
			reversedPins,
			rootId,
			await childrenOf(api, rootId),
			created
		);
		const afterReorder = await applyBookmarkOperations(
			api,
			rootId,
			reorderOperations,
			created
		);

		expect((await childrenOf(api, rootId)).map((child) => child.title)).toEqual(
			['Docs', 'News']
		);
		expect(afterReorder.bookmarkIdByLinkKey).toEqual(
			created.bookmarkIdByLinkKey
		);
		expect(
			diffPinnedFavorites(
				reversedPins,
				rootId,
				await childrenOf(api, rootId),
				afterReorder
			)
		).toEqual([]);
	});

	it('should key pins outside the collection namespace', () => {
		expect(buildPinnedLinkKey(10)).toBe('pinned:10');
	});
});
