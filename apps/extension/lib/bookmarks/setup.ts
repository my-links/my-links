import { bookmarkMirrorStorage } from '@/lib/storage';
import { BOOKMARKS_PERMISSION } from '@/lib/bookmarks/constants';
import {
	getBrowserBookmarksApi,
	type BookmarksApi,
} from '@/lib/bookmarks/bookmarks_api';
import {
	getOrCreateMyLinksRoot,
	resolveBookmarksBarId,
	takeOverBookmarksBar,
} from '@/lib/bookmarks/root';

export class BookmarksPermissionDeniedError extends Error {}

/**
 * Claims the bookmarks bar: asks for the optional `bookmarks` permission,
 * creates (or re-adopts) the single `MyLinks` root folder, and moves whatever
 * was already on the bar into a dated backup folder inside it.
 *
 * Must be called from a user gesture — `permissions.request` is rejected
 * outright otherwise.
 */
export async function enableBookmarkMirror(): Promise<void> {
	const isGranted = await browser.permissions.request({
		permissions: [BOOKMARKS_PERMISSION],
	});
	if (!isGranted) {
		throw new BookmarksPermissionDeniedError(
			'Bookmark access was refused, so nothing was changed.'
		);
	}

	const api = getBrowserBookmarksApi();
	const previousState = await bookmarkMirrorStorage.getValue();
	const rootId = await getOrCreateMyLinksRoot(api, previousState.rootId);

	// A second takeover would scoop the mirror's own folders into a new
	// backup; the first one already captured everything that predates it.
	const backupFolderId =
		previousState.backupFolderId ??
		(await takeOverBookmarksBar(api, rootId, new Date())) ??
		null;

	await bookmarkMirrorStorage.setValue({
		isEnabled: true,
		rootId,
		backupFolderId,
	});
}

/**
 * Stops mirroring and puts the bookmarks bar back the way the takeover found
 * it. The `MyLinks` folder itself is deliberately left in place: it may hold
 * bookmarks the user filed there by hand, and dropping it would be the one
 * irreversible thing this feature could do.
 */
export async function disableBookmarkMirror(): Promise<void> {
	const previousState = await bookmarkMirrorStorage.getValue();

	if (previousState.backupFolderId) {
		await restoreBookmarksBar(
			getBrowserBookmarksApi(),
			previousState.backupFolderId
		);
	}

	await bookmarkMirrorStorage.setValue({
		...previousState,
		isEnabled: false,
		backupFolderId: null,
	});
}

async function restoreBookmarksBar(
	api: BookmarksApi,
	backupFolderId: string
): Promise<void> {
	const [backupFolder] = await api.getSubTree(backupFolderId).catch(() => []);
	if (!backupFolder) {
		return;
	}

	const barId = await resolveBookmarksBarId(api);
	// Sequential: every move renumbers the bar, so a parallel restore would
	// scramble the order the backup preserved.
	for (const node of backupFolder.children ?? []) {
		await api.move(node.id, { parentId: barId });
	}

	await api.remove(backupFolderId);
}
