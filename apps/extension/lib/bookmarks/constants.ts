/**
 * The one folder collection mirroring is allowed to write into, kept first on
 * the bookmarks bar. Pinned favourites are the deliberate exception: they sit
 * on the bar itself, because reaching them through a folder is the whole
 * thing a pin is supposed to avoid.
 */
export const COLLECTIONS_FOLDER_TITLE = 'Collections';

/**
 * Chromium calls its bookmarks bar `1`, Firefox `toolbar_____`. Both are
 * stable, documented ids; anything else falls back to the first folder under
 * the tree root (see `resolveBookmarksBarId`).
 */
export const KNOWN_BOOKMARKS_BAR_IDS = ['1', 'toolbar_____'];

export const BOOKMARKS_PERMISSION = 'bookmarks';

/**
 * Long enough for a drag-and-drop of a whole folder to settle into one
 * reconciliation, short enough that an edit feels like it took effect. The
 * periodic sync alarm is the fallback for bursts that end after the MV3
 * service worker has already been suspended.
 */
export const BOOKMARK_SYNC_DEBOUNCE_MS = 7_000;
