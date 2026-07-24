import { diffBookmarkTree } from '@/lib/bookmarks/diff';
import { createLink, updateLink } from '@/lib/api/links';
import { updateCollection } from '@/lib/api/collections';
import { runWithConcurrencyLimit } from '@/lib/concurrency';
import { syncCollections } from '@/lib/sync/sync_collections';
import type { BookmarkMapping } from '@/lib/bookmarks/mapping';
import { buildDesiredTree } from '@/lib/bookmarks/desired_tree';
import { BOOKMARKS_PERMISSION } from '@/lib/bookmarks/constants';
import type { DesiredBookmark } from '@/lib/bookmarks/desired_tree';
import {
	detectInboundChanges,
	type InboundChange,
} from '@/lib/bookmarks/inbound';
import {
	getBrowserBookmarksApi,
	type BookmarksApi,
} from '@/lib/bookmarks/bookmarks_api';
import {
	getOrCreateCollectionsFolder,
	resolveBookmarksBarId,
} from '@/lib/bookmarks/root';
import {
	applyBookmarkOperations,
	MAX_CONCURRENT_BOOKMARK_WRITES,
} from '@/lib/bookmarks/apply';
import {
	bookmarkMappingStorage,
	bookmarkMirrorStorage,
	collectionsCacheStorage,
	pinnedRankingStorage,
} from '@/lib/storage';
import {
	buildPinnedReorder,
	collectFavoriteLinks,
	diffPinnedFavorites,
	resolveRankedFavorites,
} from '@/lib/bookmarks/pinned';

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
		const collectionsFolderId = await getOrCreateCollectionsFolder(
			api,
			mirrorState.rootId
		);
		if (collectionsFolderId !== mirrorState.rootId) {
			await bookmarkMirrorStorage.setValue({
				...mirrorState,
				rootId: collectionsFolderId,
			});
		}

		const barId = await resolveBookmarksBarId(api);
		const [bar] = await api.getSubTree(barId);
		const barChildren = bar?.children ?? [];
		const collectionsFolderChildren =
			barChildren.find((child) => child.id === collectionsFolderId)?.children ??
			[];
		const mapping = await bookmarkMappingStorage.getValue();

		const inboundChanges = detectInboundChanges(
			collectionsCache.collections,
			collectionsFolderChildren,
			barChildren,
			mapping
		);
		if (inboundChanges.length > 0) {
			await pushInboundChanges(inboundChanges);
			await syncCollections();
			return;
		}

		const {
			bookmarks: pinnedFavorites,
			ranking,
			wasRecomputed,
		} = resolveRankedFavorites(
			collectFavoriteLinks(collectionsCache.collections),
			await pinnedRankingStorage.getValue(),
			Date.now()
		);
		await pinnedRankingStorage.setValue(ranking);

		const operations = [
			...diffBookmarkTree(
				buildDesiredTree(collectionsCache.collections),
				collectionsFolderChildren,
				mapping
			),
			...diffPinnedFavorites(pinnedFavorites, barId, barChildren, mapping),
		];

		const nextMapping =
			operations.length > 0
				? await applyBookmarkOperations(
						api,
						collectionsFolderId,
						operations,
						mapping
					)
				: mapping;

		if (operations.length > 0) {
			await bookmarkMappingStorage.setValue(nextMapping);
		}

		// Ordering runs last and only on a fresh ranking, against the tree the
		// writes above just produced — the rest of the time a manual
		// rearrangement of the bar is left alone.
		if (wasRecomputed) {
			await applyPinnedOrder(api, barId, pinnedFavorites, nextMapping);
		}
	} catch (error) {
		console.error('MyLinks bookmark mirror failed', error);
	} finally {
		isMirroring = false;
	}
}

async function applyPinnedOrder(
	api: BookmarksApi,
	barId: string,
	pinnedFavorites: DesiredBookmark[],
	mapping: BookmarkMapping
): Promise<void> {
	const [bar] = await api.getSubTree(barId);
	const reorderOperations = buildPinnedReorder(
		pinnedFavorites,
		barId,
		bar?.children ?? [],
		mapping
	);

	if (reorderOperations.length > 0) {
		await applyBookmarkOperations(api, barId, reorderOperations, mapping);
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
