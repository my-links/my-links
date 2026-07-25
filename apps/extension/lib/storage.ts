import { storage } from 'wxt/utils/storage';

import type { CollectionWithLinks } from '@/lib/api/types';
import {
	EMPTY_PINNED_RANKING,
	type PinnedRanking,
} from '@/lib/bookmarks/pinned';
import {
	EMPTY_BOOKMARK_MAPPING,
	type BookmarkMapping,
} from '@/lib/bookmarks/mapping';
import {
	INITIAL_SYNC_BACKOFF_STATE,
	type SyncBackoffState,
} from '@/lib/sync/backoff';

const LOCAL_DEV_INSTANCE_URL = 'http://localhost:3333';
const PUBLIC_INSTANCE_URL = 'https://mylinks.app';

export const DEFAULT_INSTANCE_URL = import.meta.env.DEV
	? LOCAL_DEV_INSTANCE_URL
	: PUBLIC_INSTANCE_URL;

export const instanceUrlStorage = storage.defineItem<string>(
	'local:instanceUrl',
	{ fallback: DEFAULT_INSTANCE_URL }
);

export const apiTokenStorage = storage.defineItem<string | null>(
	'local:apiToken',
	{ fallback: null }
);

export interface CollectionsCache {
	collections: CollectionWithLinks[];
	fetchedAt: number;
}

const EMPTY_COLLECTIONS_CACHE: CollectionsCache = {
	collections: [],
	fetchedAt: 0,
};

/**
 * Written by the background worker, read by every open sidebar/newtab —
 * the single source of truth the UI hydrates from instantly on mount so it
 * never shows a blank/loading state on reopen (see `use_collections.ts`).
 */
export const collectionsCacheStorage = storage.defineItem<CollectionsCache>(
	'local:collectionsCache',
	{ fallback: EMPTY_COLLECTIONS_CACHE }
);

export const syncBackoffStorage = storage.defineItem<SyncBackoffState>(
	'local:syncBackoff',
	{ fallback: INITIAL_SYNC_BACKOFF_STATE }
);

/**
 * Backoff for the bookmark mirror, kept separate from the collections sync:
 * a server rejecting writes (rate limit, outage) must not keep the mirror
 * retrying on every tab switch and bookmark event, and it must not stop the
 * sidebar from refreshing its read-only view either.
 */
export const bookmarkBackoffStorage = storage.defineItem<SyncBackoffState>(
	'local:bookmarkBackoff',
	{ fallback: INITIAL_SYNC_BACKOFF_STATE }
);

/**
 * True when the last sync attempt was rejected with a 401 — the stored token
 * is dead (deleted/expired) and needs a reconnect, not just a retry. Kept
 * separate from the backoff state so the UI can show a distinct "reconnect"
 * prompt rather than a generic "stale" badge.
 */
export const authInvalidStorage = storage.defineItem<boolean>(
	'local:authInvalid',
	{ fallback: false }
);

export interface BookmarkMirrorState {
	isEnabled: boolean;
	/** Id of the `Collections` folder holding the mirrored collections. */
	rootId: string | null;
}

const DISABLED_BOOKMARK_MIRROR: BookmarkMirrorState = {
	isEnabled: false,
	rootId: null,
};

/**
 * Off until the user turns it on from the options page — putting things on
 * someone's bookmarks bar is not something to do behind their back. The
 * `bookmarks` permission is optional for the same reason.
 */
export const bookmarkMirrorStorage = storage.defineItem<BookmarkMirrorState>(
	'local:bookmarkMirror',
	{ fallback: DISABLED_BOOKMARK_MIRROR }
);

/**
 * Signature of the last set of native changes pushed to the server. A pass
 * that produces the very same set again has not converged — the server is
 * rewriting what it is told — so it is reported as a failure instead of
 * being pushed a second time. Cleared as soon as a pass finds nothing to
 * push. See `lib/bookmarks/change_fingerprint.ts`.
 */
export const lastPushedChangesStorage = storage.defineItem<string | null>(
	'local:lastPushedBookmarkChanges',
	{ fallback: null }
);

/**
 * Which native bookmark node stands for which collection/link. Persisted
 * because it is also the mirror's safety fence: only nodes recorded here may
 * ever be deleted, so the takeover backup and anything the user filed by
 * hand cannot be touched by a diff.
 */
export const bookmarkMappingStorage = storage.defineItem<BookmarkMapping>(
	'local:bookmarkMapping',
	{ fallback: EMPTY_BOOKMARK_MAPPING }
);

/**
 * The order favourites are pinned in, and when it was last worked out.
 * Persisted so the bar isn't reshuffled on every sync: the ranking is only
 * recomputed daily, or when the set of favourites itself changes.
 */
export const pinnedRankingStorage = storage.defineItem<PinnedRanking>(
	'local:pinnedRanking',
	{ fallback: EMPTY_PINNED_RANKING }
);

/**
 * Switching instances or logging out must never leak data across origins:
 * the token is instance-specific, and any cached API data (TanStack Query
 * cache) is invalidated by the caller once this resolves.
 *
 * The cached tree and the bookmark mapping go too. They describe one
 * account's collections, and reconnecting may well be as somebody else — a
 * mapping kept across that would point native bookmarks at entity ids
 * belonging to a different user. Clearing the cache also parks the mirror
 * (it refuses to run against a tree it has never fetched) until the new
 * session has synced once.
 */
export async function clearExtensionSession(): Promise<void> {
	await apiTokenStorage.removeValue();
	await authInvalidStorage.removeValue();
	await collectionsCacheStorage.removeValue();
	await bookmarkMappingStorage.removeValue();
	await pinnedRankingStorage.removeValue();
	await lastPushedChangesStorage.removeValue();
}
