import { bookmarkMirrorStorage } from '@/lib/storage';
import { BOOKMARKS_PERMISSION } from '@/lib/bookmarks/constants';
import { getOrCreateCollectionsFolder } from '@/lib/bookmarks/root';
import { getBrowserBookmarksApi } from '@/lib/bookmarks/bookmarks_api';

export class BookmarksPermissionDeniedError extends Error {}

/**
 * Asks for the optional `bookmarks` permission and creates (or re-adopts) the
 * `Collections` folder on the bookmarks bar.
 *
 * Nothing that was already on the bar is moved, renamed or deleted: the
 * mirror only ever adds its own nodes alongside the user's, and only nodes it
 * created are ever eligible for removal later.
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

	const previousState = await bookmarkMirrorStorage.getValue();
	const rootId = await getOrCreateCollectionsFolder(
		getBrowserBookmarksApi(),
		previousState.rootId
	);

	await bookmarkMirrorStorage.setValue({ isEnabled: true, rootId });
}

/**
 * Stops mirroring and leaves the bookmarks exactly where they are. Deleting
 * them would be the one irreversible thing this feature could do, and the
 * user may well want to keep the folder — the point of turning it off is that
 * it stops changing, not that it vanishes.
 */
export async function disableBookmarkMirror(): Promise<void> {
	const previousState = await bookmarkMirrorStorage.getValue();
	await bookmarkMirrorStorage.setValue({ ...previousState, isEnabled: false });
}
