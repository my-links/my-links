/**
 * The one folder MyLinks is ever allowed to write into. Everything the
 * mirror creates, renames or deletes lives under it, which is what bounds
 * the blast radius: the rest of the user's bookmarks are never touched.
 */
export const BOOKMARK_ROOT_TITLE = 'MyLinks';

export const BACKUP_FOLDER_TITLE_PREFIX = 'Backup';

/**
 * Chromium calls its bookmarks bar `1`, Firefox `toolbar_____`. Both are
 * stable, documented ids; anything else falls back to the first folder under
 * the tree root (see `resolveBookmarksBarId`).
 */
export const KNOWN_BOOKMARKS_BAR_IDS = ['1', 'toolbar_____'];

export const BOOKMARKS_PERMISSION = 'bookmarks';
