import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import { BACKUP_FOLDER_TITLE_PREFIX } from '@/lib/bookmarks/constants';

/**
 * Dated so a second takeover (after a reinstall, say) never merges into the
 * first one's folder — each attempt keeps its own snapshot of what the bar
 * looked like beforehand.
 */
export function buildBackupFolderTitle(takenOverAt: Date): string {
	const date = takenOverAt.toISOString().slice(0, 'YYYY-MM-DD'.length);
	return `${BACKUP_FOLDER_TITLE_PREFIX} ${date}`;
}

/**
 * Everything already sitting on the bookmarks bar, minus MyLinks' own root
 * folder — moving that into its own backup would nest the mirror inside
 * itself and orphan every mapped node.
 */
export function selectNodesToBackUp(
	barChildren: BookmarkNode[],
	rootId: string
): BookmarkNode[] {
	return barChildren.filter((child) => child.id !== rootId);
}
