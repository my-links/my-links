import { storage } from 'wxt/utils/storage';

import { SEARCH_FOCUS_REQUEST_TTL_MS } from './constants';

/**
 * When the keyboard shortcut last asked for the search field, or `null` when
 * nothing is pending.
 *
 * A stored flag rather than a runtime message because the shortcut has two
 * very different audiences: a side panel that is already open (which reacts
 * through the watcher) and one that is still booting because the shortcut is
 * what opened it (which has no listener yet, and reads the flag on mount).
 * Session-scoped so it can never survive a browser restart.
 */
export const searchFocusRequestStorage = storage.defineItem<number | null>(
	'session:searchFocusRequestedAt',
	{ fallback: null }
);

export async function requestSearchFocus(): Promise<void> {
	await searchFocusRequestStorage.setValue(Date.now());
}

export function isSearchFocusRequestFresh(requestedAt: number | null): boolean {
	if (requestedAt === null) {
		return false;
	}

	return Date.now() - requestedAt < SEARCH_FOCUS_REQUEST_TTL_MS;
}

/**
 * Reads the pending request and clears it, so a page mounting later doesn't
 * grab focus a second time for the same keystroke.
 */
export async function consumeSearchFocusRequest(): Promise<boolean> {
	const requestedAt = await searchFocusRequestStorage.getValue();
	await searchFocusRequestStorage.removeValue();

	return isSearchFocusRequestFresh(requestedAt);
}
