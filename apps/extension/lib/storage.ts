import { storage } from 'wxt/utils/storage';

import type { CollectionWithLinks } from '@/lib/api/types';
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
 * True when the last sync attempt was rejected with a 401 — the stored token
 * is dead (deleted/expired) and needs a reconnect, not just a retry. Kept
 * separate from the backoff state so the UI can show a distinct "reconnect"
 * prompt rather than a generic "stale" badge.
 */
export const authInvalidStorage = storage.defineItem<boolean>(
	'local:authInvalid',
	{ fallback: false }
);

/**
 * Switching instances or logging out must never leak data across origins:
 * the token is instance-specific, and any cached API data (TanStack Query
 * cache) is invalidated by the caller once this resolves.
 */
export async function clearExtensionSession(): Promise<void> {
	await apiTokenStorage.removeValue();
	await authInvalidStorage.removeValue();
}
