import { buildReorderOperation } from '@/lib/bookmarks/ordering';
import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import type { BookmarkOperation } from '@/lib/bookmarks/operations';
import type { DesiredBookmark } from '@/lib/bookmarks/desired_tree';
import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';
import {
	getMappedBookmarkId,
	type BookmarkMapping,
} from '@/lib/bookmarks/mapping';

/**
 * Pinned favourites are keyed outside the `collectionId:linkId` namespace so
 * nothing else in the mirror mistakes them for collection membership: the
 * folder diff can never claim one, and membership reconciliation ignores
 * them.
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

export function parsePinnedLinkKey(linkKey: string): number | undefined {
	const [prefix, rawLinkId] = linkKey.split(':');
	if (prefix !== PINNED_LINK_KEY_PREFIX) {
		return undefined;
	}

	const linkId = Number(rawLinkId);
	return Number.isInteger(linkId) ? linkId : undefined;
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
 * Returns the favourites in the order they should appear on the bar, the
 * ranking to remember, and whether it was worked out afresh. Callers use that
 * last flag to decide whether to impose the order on the bar at all — a
 * stale-but-valid ranking is reused verbatim so the bar stays put.
 */
export function resolveRankedFavorites(
	favorites: LinkResource[],
	ranking: PinnedRanking,
	now: number
): {
	bookmarks: DesiredBookmark[];
	ranking: PinnedRanking;
	wasRecomputed: boolean;
} {
	const favoriteLinkIds = favorites.map((link) => link.id);

	if (!shouldRecomputeRanking(ranking, favoriteLinkIds, now)) {
		return {
			bookmarks: orderBy(favorites, ranking.rankedLinkIds).map(
				toDesiredBookmark
			),
			ranking,
			wasRecomputed: false,
		};
	}

	const ranked = [...favorites].sort(byClicksThenName);
	return {
		bookmarks: ranked.map(toDesiredBookmark),
		ranking: {
			rankedLinkIds: ranked.map((link) => link.id),
			computedAt: now,
		},
		wasRecomputed: true,
	};
}

/**
 * Imposing the order is a separate step because it is throttled: only a
 * freshly computed ranking earns the right to rearrange the bar, so a manual
 * reordering survives until the next recompute instead of being undone by the
 * very next sync.
 */
export function buildPinnedReorder(
	desiredBookmarks: DesiredBookmark[],
	barId: string,
	barChildren: BookmarkNode[],
	mapping: BookmarkMapping
): BookmarkOperation[] {
	const desiredNodeIds = desiredBookmarks
		.map((bookmark) =>
			getMappedBookmarkId(mapping, buildPinnedLinkKey(bookmark.linkId))
		)
		.filter((nodeId): nodeId is string => nodeId !== undefined);

	return buildReorderOperation(desiredNodeIds, barId, barChildren);
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
