import {
	COLLECTIONS_FOLDER_TITLE,
	KNOWN_BOOKMARKS_BAR_IDS,
} from '@/lib/bookmarks/constants';
import {
	isFolder,
	type BookmarkNode,
	type BookmarksApi,
} from '@/lib/bookmarks/bookmarks_api';

export class BookmarksUnavailableError extends Error {}

const COLLECTIONS_FOLDER_POSITION = 0;

/**
 * Both halves of the mirror live here: the `Collections` folder is created on
 * the bar, and pinned favourites are placed on the bar itself.
 */
export async function resolveBookmarksBarId(
	api: BookmarksApi
): Promise<string> {
	const [treeRoot] = await api.getTree();
	const topLevelFolders = treeRoot?.children ?? [];

	const knownBar = topLevelFolders.find((folder) =>
		KNOWN_BOOKMARKS_BAR_IDS.includes(folder.id)
	);
	if (knownBar) {
		return knownBar.id;
	}

	const firstFolder = topLevelFolders.find(isFolder);
	if (!firstFolder) {
		throw new BookmarksUnavailableError(
			'This browser exposes no bookmarks bar to mirror into.'
		);
	}
	return firstFolder.id;
}

/**
 * Reuses the folder recorded last time when it still exists, then a folder of
 * the right name already on the bar (a reinstall must adopt what it left
 * behind rather than build a second one), and only creates one when neither
 * is there.
 *
 * Kept first on the bar so it never drifts into the middle of the user's own
 * bookmarks, and retitled if an earlier version of the extension named it
 * something else.
 */
export async function getOrCreateCollectionsFolder(
	api: BookmarksApi,
	knownFolderId: string | null
): Promise<string> {
	const barId = await resolveBookmarksBarId(api);
	const [bar] = await api.getSubTree(barId);
	const barChildren = bar?.children ?? [];

	const existingFolder =
		findById(barChildren, knownFolderId) ?? findByTitle(barChildren);

	if (!existingFolder) {
		const createdFolder = await api.create({
			parentId: barId,
			title: COLLECTIONS_FOLDER_TITLE,
			index: COLLECTIONS_FOLDER_POSITION,
		});
		return createdFolder.id;
	}

	if (existingFolder.title !== COLLECTIONS_FOLDER_TITLE) {
		await api.update(existingFolder.id, { title: COLLECTIONS_FOLDER_TITLE });
	}
	if (barChildren.indexOf(existingFolder) !== COLLECTIONS_FOLDER_POSITION) {
		await api.move(existingFolder.id, {
			parentId: barId,
			index: COLLECTIONS_FOLDER_POSITION,
		});
	}

	return existingFolder.id;
}

/**
 * Matched by id first: the folder may have been renamed by the user, and
 * their name is worth keeping around only until the next pass retitles it —
 * losing track of it entirely would strand every mapped collection under it.
 */
function findById(
	barChildren: BookmarkNode[],
	folderId: string | null
): BookmarkNode | undefined {
	if (!folderId) {
		return undefined;
	}
	return barChildren.find((child) => child.id === folderId && isFolder(child));
}

function findByTitle(barChildren: BookmarkNode[]): BookmarkNode | undefined {
	return barChildren.find(
		(child) => isFolder(child) && child.title === COLLECTIONS_FOLDER_TITLE
	);
}
