import { diffBookmarkTree } from '@/lib/bookmarks/diff';
import { createLink, updateLink } from '@/lib/api/links';
import { updateCollection } from '@/lib/api/collections';
import { runWithConcurrencyLimit } from '@/lib/concurrency';
import { syncCollections } from '@/lib/sync/sync_collections';
import { getOrCreateMyLinksRoot } from '@/lib/bookmarks/root';
import { buildDesiredTree } from '@/lib/bookmarks/desired_tree';
import { BOOKMARKS_PERMISSION } from '@/lib/bookmarks/constants';
import { getBrowserBookmarksApi } from '@/lib/bookmarks/bookmarks_api';
import {
	detectInboundChanges,
	type InboundChange,
} from '@/lib/bookmarks/inbound';
import {
	applyBookmarkOperations,
	MAX_CONCURRENT_BOOKMARK_WRITES,
} from '@/lib/bookmarks/apply';
import {
	collectFavoriteLinks,
	diffPinnedFavorites,
	resolveRankedFavorites,
} from '@/lib/bookmarks/pinned';
import {
	bookmarkMappingStorage,
	bookmarkMirrorStorage,
	collectionsCacheStorage,
	pinnedRankingStorage,
} from '@/lib/storage';

let isMirroring = false;

/**
 * One reconciliation pass between the server's collections and the native
 * bookmarks tree.
 *
 * Native edits are pushed first. When there are any, the pass stops right
 * after refreshing the collections cache instead of also mirroring: the
 * server has just assigned real ids, and the cache watcher re-enters here
 * with them. Two short converging passes beat one pass reasoning about
 * records it half-invented.
 */
export async function syncBookmarks(): Promise<void> {
	// Set before the first `await`, like the collections sync mutex: a
	// bookmark event and an alarm landing in the same tick must not both get
	// past this check.
	if (isMirroring) {
		return;
	}
	isMirroring = true;

	try {
		const mirrorState = await bookmarkMirrorStorage.getValue();
		if (!mirrorState.isEnabled) {
			return;
		}

		const hasPermission = await browser.permissions.contains({
			permissions: [BOOKMARKS_PERMISSION],
		});
		if (!hasPermission) {
			return;
		}

		const collectionsCache = await collectionsCacheStorage.getValue();
		// Never synced yet: an empty cache would read as "the user deleted
		// everything" and the diff would tear the mirror down.
		if (collectionsCache.fetchedAt === 0) {
			return;
		}

		const api = getBrowserBookmarksApi();
		const rootId = await getOrCreateMyLinksRoot(api, mirrorState.rootId);
		if (rootId !== mirrorState.rootId) {
			await bookmarkMirrorStorage.setValue({ ...mirrorState, rootId });
		}

		const [root] = await api.getSubTree(rootId);
		const rootChildren = root?.children ?? [];
		const mapping = await bookmarkMappingStorage.getValue();

		const inboundChanges = detectInboundChanges(
			collectionsCache.collections,
			rootChildren,
			mapping
		);
		if (inboundChanges.length > 0) {
			await pushInboundChanges(inboundChanges);
			await syncCollections();
			return;
		}

		const { bookmarks: pinnedFavorites, ranking } = resolveRankedFavorites(
			collectFavoriteLinks(collectionsCache.collections),
			await pinnedRankingStorage.getValue(),
			Date.now()
		);
		await pinnedRankingStorage.setValue(ranking);

		const operations = [
			...diffBookmarkTree(
				buildDesiredTree(collectionsCache.collections),
				rootChildren,
				mapping
			),
			...diffPinnedFavorites(pinnedFavorites, rootId, rootChildren, mapping),
		];
		if (operations.length === 0) {
			return;
		}

		await bookmarkMappingStorage.setValue(
			await applyBookmarkOperations(api, rootId, operations, mapping)
		);
	} catch (error) {
		console.error('MyLinks bookmark mirror failed', error);
	} finally {
		isMirroring = false;
	}
}

function pushInboundChanges(changes: InboundChange[]): Promise<unknown[]> {
	return runWithConcurrencyLimit(
		changes.map((change) => () => pushInboundChange(change)),
		MAX_CONCURRENT_BOOKMARK_WRITES
	);
}

async function pushInboundChange(change: InboundChange): Promise<void> {
	switch (change.kind) {
		case 'create-link':
			return await createLink({
				name: change.name,
				url: change.url,
				favorite: false,
				collectionIds: [change.collectionId],
			});
		case 'update-link':
			return await updateLink(change.linkId, {
				name: change.name,
				url: change.url,
				description: change.description,
				favorite: change.favorite,
				collectionIds: change.collectionIds,
			});
		case 'rename-collection':
			return await updateCollection(change.collectionId, {
				name: change.name,
				description: change.description,
				visibility: change.visibility,
				icon: change.icon,
			});
	}
}
