import type { BookmarkOperation } from '@/lib/bookmarks/diff';
import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import type { DesiredBookmark } from '@/lib/bookmarks/desired_tree';
import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';
import {
	getMappedBookmarkId,
	type BookmarkMapping,
} from '@/lib/bookmarks/mapping';

/**
 * Pinned favourites are keyed outside the `collectionId:linkId` namespace so
 * nothing else in the mirror mistakes them for collection members: the
 * inbound reconciliation skips them (a pin is a projection of the favourite
 * flag, not a membership), and a folder diff can never claim one.
 */
const PINNED_LINK_KEY_PREFIX = 'pinned';

export type PinnedRanking = {
	rankedLinkIds: number[];
	computedAt: number;
};

export const EMPTY_PINNED_RANKING: PinnedRanking = {
	rankedLinkIds: [],
	computedAt: 0,
};

/**
 * How long a ranking is trusted before click counts are consulted again.
 * Reordering the bar on every click is exactly the churn that made the old
 * extension unusable, so the order is a daily snapshot — plus an immediate
 * recompute whenever the set of favourites itself changes.
 */
export const RANKING_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1_000;

export function buildPinnedLinkKey(linkId: number): string {
	return `${PINNED_LINK_KEY_PREFIX}:${linkId}`;
}

/** Every favourite, once, no matter how many collections it belongs to. */
export function collectFavoriteLinks(
	collections: CollectionWithLinks[]
): LinkResource[] {
	const favoritesById = new Map<number, LinkResource>();

	for (const collection of collections) {
		for (const link of collection.links ?? []) {
			if (link.favorite) {
				favoritesById.set(link.id, link);
			}
		}
	}

	return [...favoritesById.values()];
}

export function shouldRecomputeRanking(
	ranking: PinnedRanking,
	favoriteLinkIds: number[],
	now: number
): boolean {
	const rankedIds = new Set(ranking.rankedLinkIds);
	const hasSameMembers =
		rankedIds.size === favoriteLinkIds.length &&
		favoriteLinkIds.every((linkId) => rankedIds.has(linkId));

	return (
		!hasSameMembers || now - ranking.computedAt >= RANKING_REFRESH_INTERVAL_MS
	);
}

/**
 * Returns the favourites in the order they should appear on the bar, and the
 * ranking to remember. A stale-but-valid ranking is reused verbatim so the
 * bar only reshuffles under the user when there is a real reason to.
 */
export function resolveRankedFavorites(
	favorites: LinkResource[],
	ranking: PinnedRanking,
	now: number
): { bookmarks: DesiredBookmark[]; ranking: PinnedRanking } {
	const favoriteLinkIds = favorites.map((link) => link.id);

	if (!shouldRecomputeRanking(ranking, favoriteLinkIds, now)) {
		return {
			bookmarks: orderBy(favorites, ranking.rankedLinkIds).map(
				toDesiredBookmark
			),
			ranking,
		};
	}

	const ranked = [...favorites].sort(byClicksThenName);
	return {
		bookmarks: ranked.map(toDesiredBookmark),
		ranking: {
			rankedLinkIds: ranked.map((link) => link.id),
			computedAt: now,
		},
	};
}

/**
 * Pinned favourites sit directly under the MyLinks root, alongside the
 * collection folders, so they are one click away on the bar.
 */
export function diffPinnedFavorites(
	desiredBookmarks: DesiredBookmark[],
	rootId: string,
	rootChildren: BookmarkNode[],
	mapping: BookmarkMapping
): BookmarkOperation[] {
	const rootChildrenById = new Map(
		rootChildren.map((child) => [child.id, child])
	);
	const claimedNodeIds: string[] = [];

	const upserts = desiredBookmarks.flatMap(
		(desiredBookmark): BookmarkOperation[] => {
			const linkKey = buildPinnedLinkKey(desiredBookmark.linkId);
			const mappedNodeId = getMappedBookmarkId(mapping, linkKey);
			const actualNode = mappedNodeId
				? rootChildrenById.get(mappedNodeId)
				: undefined;

			if (!actualNode) {
				return [
					{
						kind: 'create-bookmark',
						parentNodeId: rootId,
						linkKey,
						title: desiredBookmark.title,
						url: desiredBookmark.url,
					},
				];
			}

			claimedNodeIds.push(actualNode.id);

			if (
				actualNode.title === desiredBookmark.title &&
				actualNode.url === desiredBookmark.url
			) {
				return [];
			}

			return [
				{
					kind: 'update-bookmark',
					nodeId: actualNode.id,
					title: desiredBookmark.title,
					url: desiredBookmark.url,
				},
			];
		}
	);

	return [
		...upserts,
		...findUnpinnedBookmarks(desiredBookmarks, rootChildren, mapping),
		...buildReorderOperation(rootId, claimedNodeIds, rootChildren),
	];
}

/** A link that stopped being a favourite loses its pin, nothing else. */
function findUnpinnedBookmarks(
	desiredBookmarks: DesiredBookmark[],
	rootChildren: BookmarkNode[],
	mapping: BookmarkMapping
): BookmarkOperation[] {
	const desiredLinkKeys = new Set(
		desiredBookmarks.map((bookmark) => buildPinnedLinkKey(bookmark.linkId))
	);
	const presentNodeIds = new Set(rootChildren.map((child) => child.id));

	return Object.entries(mapping.bookmarkIdByLinkKey)
		.filter(([linkKey]) => linkKey.startsWith(`${PINNED_LINK_KEY_PREFIX}:`))
		.filter(([linkKey]) => !desiredLinkKeys.has(linkKey))
		.filter(([, nodeId]) => presentNodeIds.has(nodeId))
		.map(
			([linkKey, nodeId]): BookmarkOperation => ({
				kind: 'remove-bookmark',
				nodeId,
				linkKey,
			})
		);
}

/**
 * Only emitted when the pins are actually out of order — otherwise every
 * pass would move nodes that are already where they belong.
 */
function buildReorderOperation(
	rootId: string,
	claimedNodeIds: string[],
	rootChildren: BookmarkNode[]
): BookmarkOperation[] {
	const actualPinnedOrder = rootChildren
		.filter((child) => claimedNodeIds.includes(child.id))
		.map((child) => child.id);

	const isAlreadyOrdered =
		actualPinnedOrder.length === claimedNodeIds.length &&
		actualPinnedOrder.every(
			(nodeId, index) => nodeId === claimedNodeIds[index]
		);

	if (isAlreadyOrdered) {
		return [];
	}

	return [
		{
			kind: 'reorder-pinned',
			parentNodeId: rootId,
			nodeIdsInOrder: claimedNodeIds,
		},
	];
}

function toDesiredBookmark(link: LinkResource): DesiredBookmark {
	return { linkId: link.id, title: link.name, url: link.url };
}

function orderBy(
	favorites: LinkResource[],
	rankedLinkIds: number[]
): LinkResource[] {
	const rankByLinkId = new Map(
		rankedLinkIds.map((linkId, rank) => [linkId, rank])
	);

	return [...favorites].sort(
		(left, right) =>
			(rankByLinkId.get(left.id) ?? rankedLinkIds.length) -
			(rankByLinkId.get(right.id) ?? rankedLinkIds.length)
	);
}

function byClicksThenName(left: LinkResource, right: LinkResource): number {
	if (left.clicks !== right.clicks) {
		return right.clicks - left.clicks;
	}
	return left.name.localeCompare(right.name);
}
