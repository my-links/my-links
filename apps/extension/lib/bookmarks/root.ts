import {
	buildBackupFolderTitle,
	selectNodesToBackUp,
} from '@/lib/bookmarks/backup';
import {
	BOOKMARK_ROOT_TITLE,
	KNOWN_BOOKMARKS_BAR_IDS,
} from '@/lib/bookmarks/constants';
import {
	isFolder,
	type BookmarkNode,
	type BookmarksApi,
} from '@/lib/bookmarks/bookmarks_api';

export class BookmarksUnavailableError extends Error {}

/**
 * The bar is where a takeover has to look, and where the MyLinks root is
 * created so the mirror is visible without opening a menu.
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
 * Reuses the root recorded last time when it still exists, then an untouched
 * `MyLinks` folder already on the bar (a reinstall must adopt the mirror it
 * left behind rather than build a second one), and only creates a new folder
 * when neither is there.
 */
export async function getOrCreateMyLinksRoot(
	api: BookmarksApi,
	knownRootId: string | null
): Promise<string> {
	if (knownRootId && (await isExistingNode(api, knownRootId))) {
		return knownRootId;
	}

	const barId = await resolveBookmarksBarId(api);
	const [bar] = await api.getSubTree(barId);
	const existingRoot = (bar?.children ?? []).find(
		(child) => isFolder(child) && child.title === BOOKMARK_ROOT_TITLE
	);
	if (existingRoot) {
		return existingRoot.id;
	}

	const createdRoot = await api.create({
		parentId: barId,
		title: BOOKMARK_ROOT_TITLE,
	});
	return createdRoot.id;
}

/**
 * Moves whatever was already on the bookmarks bar into a dated backup folder
 * inside the MyLinks root, so the mirror starts from a bar it fully owns.
 *
 * Nothing is ever deleted — every node keeps its id, its children and its
 * URL, one level deeper. Returns the backup folder id, or `undefined` when
 * the bar held nothing worth moving.
 */
export async function takeOverBookmarksBar(
	api: BookmarksApi,
	rootId: string,
	takenOverAt: Date
): Promise<string | undefined> {
	const barId = await resolveBookmarksBarId(api);
	const [bar] = await api.getSubTree(barId);
	const nodesToBackUp = selectNodesToBackUp(bar?.children ?? [], rootId);

	if (nodesToBackUp.length === 0) {
		return undefined;
	}

	const backupFolder = await api.create({
		parentId: rootId,
		title: buildBackupFolderTitle(takenOverAt),
	});

	// Sequential on purpose: each move reshuffles the bar's indexes, and
	// racing them would interleave the backup in an order the user never had.
	for (const node of nodesToBackUp) {
		await api.move(node.id, { parentId: backupFolder.id });
	}

	return backupFolder.id;
}

async function isExistingNode(api: BookmarksApi, id: string): Promise<boolean> {
	try {
		const [node] = await api.getSubTree(id);
		return isPresent(node);
	} catch {
		// `getSubTree` rejects for an id the browser no longer knows — the
		// user deleted our folder by hand. Treated as "gone", not as a
		// failure worth surfacing.
		return false;
	}
}

function isPresent(node: BookmarkNode | undefined): node is BookmarkNode {
	return node !== undefined;
}
