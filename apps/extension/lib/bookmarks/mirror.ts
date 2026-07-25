import { diffBookmarkTree } from '@/lib/bookmarks/diff';
import { createLink, updateLink } from '@/lib/api/links';
import { updateCollection } from '@/lib/api/collections';
import { remapOrphanedNodes } from '@/lib/bookmarks/remap';
import { runWithConcurrencyLimit } from '@/lib/concurrency';
import { syncCollections } from '@/lib/sync/sync_collections';
import { createCoalescingRunner } from '@/lib/coalescing_runner';
import { BOOKMARKS_PERMISSION } from '@/lib/bookmarks/constants';
import type { DesiredBookmark } from '@/lib/bookmarks/desired_tree';
import { buildDesiredTree, buildLinkKey } from '@/lib/bookmarks/desired_tree';
import { fingerprintInboundChanges } from '@/lib/bookmarks/change_fingerprint';
import {
	detectInboundChanges,
	type InboundChange,
} from '@/lib/bookmarks/inbound';
import {
	getOrCreateCollectionsFolder,
	resolveBookmarksBarId,
} from '@/lib/bookmarks/root';
import {
	applyBookmarkOperations,
	MAX_CONCURRENT_BOOKMARK_WRITES,
} from '@/lib/bookmarks/apply';
import {
	withMappedBookmark,
	withNodeTitles,
	type BookmarkMapping,
} from '@/lib/bookmarks/mapping';
import {
	getBrowserBookmarksApi,
	indexBySubtreeId,
	type BookmarksApi,
} from '@/lib/bookmarks/bookmarks_api';
import {
	computeBackoffAfterFailure,
	INITIAL_SYNC_BACKOFF_STATE,
	isSyncBackingOff,
} from '@/lib/sync/backoff';
import {
	buildPinnedReorder,
	collectFavoriteLinks,
	diffPinnedFavorites,
	resolveRankedFavorites,
} from '@/lib/bookmarks/pinned';
import {
	bookmarkBackoffStorage,
	bookmarkMappingStorage,
	bookmarkMirrorStorage,
	collectionsCacheStorage,
	lastPushedChangesStorage,
	pinnedRankingStorage,
	syncBackoffStorage,
} from '@/lib/storage';

/**
 * Reconciles the server's collections with the native bookmarks tree.
 *
 * Native edits are pushed first. When there are any, the pass stops right
 * after refreshing the collections cache instead of also mirroring: the
 * server has just assigned real ids, and the run repeats with them. Two short
 * converging passes beat one pass reasoning about records it half-invented.
 *
 * Coalescing rather than a plain mutex, because that convergence depends on
 * it: a request arriving mid-pass — the cache write from the sync above, a
 * bookmark event, the alarm — is what carries the mirror to its next state,
 * and dropping it would strand the two sides apart until an unrelated trigger
 * happened along.
 */
export const syncBookmarks = createCoalescingRunner(runGuardedMirrorPass);

export class BookmarkMirrorError extends Error {}

/**
 * A failed pass backs the mirror off instead of letting every tab switch and
 * bookmark event retry immediately. Kept separate from the collections sync's
 * backoff: the sidebar's read-only refresh has no reason to stop because the
 * server is rejecting *writes*.
 */
async function runGuardedMirrorPass(): Promise<void> {
	const backoffState = await bookmarkBackoffStorage.getValue();
	if (isSyncBackingOff(backoffState, Date.now())) {
		return;
	}

	try {
		await runMirrorPass();
		await bookmarkBackoffStorage.setValue(INITIAL_SYNC_BACKOFF_STATE);
	} catch (error) {
		console.error('MyLinks bookmark mirror failed', error);
		await bookmarkBackoffStorage.setValue(
			computeBackoffAfterFailure(backoffState, Date.now())
		);
	}
}

async function runMirrorPass(): Promise<void> {
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

	// Reconciling against a cache the sync is currently failing to refresh
	// means judging the server by an out-of-date picture of it — every native
	// edit would be re-detected and re-pushed until the instance comes back.
	// The mirror waits alongside the sync instead.
	const syncBackoff = await syncBackoffStorage.getValue();
	if (isSyncBackingOff(syncBackoff, Date.now())) {
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
	const desiredFolders = buildDesiredTree(collectionsCache.collections);
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

	// Before anything is judged: nodes the mirror created but can no longer
	// recognise are claimed back. Storage does not survive a reinstall while
	// the bookmarks do, and without this every one of them would be read as
	// user content — adopted into duplicate links, and shadowed by a second
	// set of folders.
	const storedMapping = await bookmarkMappingStorage.getValue();
	const mapping = remapOrphanedNodes(
		desiredFolders,
		pinnedFavorites,
		collectionsFolderChildren,
		barChildren,
		storedMapping
	);
	if (mapping !== storedMapping) {
		await bookmarkMappingStorage.setValue(mapping);
	}

	const inboundChanges = detectInboundChanges(
		collectionsCache.collections,
		collectionsFolderChildren,
		barChildren,
		mapping
	);
	if (inboundChanges.length > 0) {
		const fingerprint = fingerprintInboundChanges(inboundChanges);
		if (fingerprint === (await lastPushedChangesStorage.getValue())) {
			throw new BookmarkMirrorError(
				'The same native changes came back after being pushed — the server is not recording them as sent'
			);
		}

		const { adoptions, failedChangeCount } =
			await pushInboundChanges(inboundChanges);

		// Recorded before anything else can run: an adopted node that stays
		// unmapped is read as a user-added bookmark on the next pass and
		// adopted all over again, creating a duplicate link every time.
		if (adoptions.length > 0) {
			await bookmarkMappingStorage.setValue(
				adoptions.reduce(
					(current, adoption) =>
						withMappedBookmark(current, adoption.linkKey, adoption.nodeId),
					mapping
				)
			);
		}

		await syncCollections();

		// The fingerprint only means anything once the push has been read back
		// from the server. If the resync could not reach it, the next pass
		// re-reads the same stale cache and would find the same changes —
		// which is a failure to verify, not the server refusing to record
		// them. Recording the fingerprint then would raise a false alarm.
		const hasRefreshedCache =
			(await collectionsCacheStorage.getValue()).fetchedAt >
			collectionsCache.fetchedAt;

		await lastPushedChangesStorage.setValue(
			hasRefreshedCache ? fingerprint : null
		);

		await snapshotNodeTitles(api, barId);

		if (failedChangeCount > 0) {
			throw new BookmarkMirrorError(
				`${failedChangeCount} native bookmark changes could not be pushed`
			);
		}
		if (!hasRefreshedCache) {
			throw new BookmarkMirrorError(
				'Native changes were pushed but the instance could not be reached to confirm them'
			);
		}
		return;
	}

	await lastPushedChangesStorage.setValue(null);

	const operations = [
		...diffBookmarkTree(desiredFolders, collectionsFolderChildren, mapping),
		...diffPinnedFavorites(pinnedFavorites, barId, barChildren, mapping),
	];

	let nextMapping = mapping;
	let failedOperationCount = 0;

	if (operations.length > 0) {
		const applyResult = await applyBookmarkOperations(
			api,
			collectionsFolderId,
			operations,
			mapping
		);
		nextMapping = applyResult.mapping;
		failedOperationCount = applyResult.failedOperationCount;
		await bookmarkMappingStorage.setValue(nextMapping);
	}

	// Ordering runs last and only on a fresh ranking, against the tree the
	// writes above just produced — the rest of the time a manual
	// rearrangement of the bar is left alone.
	if (wasRecomputed) {
		await applyPinnedOrder(api, barId, pinnedFavorites, nextMapping);
	}

	await snapshotNodeTitles(api, barId);

	if (failedOperationCount > 0) {
		throw new BookmarkMirrorError(
			`${failedOperationCount} bookmark operations failed`
		);
	}
}

/**
 * Records every mapped node's current title as the settled state, at the end
 * of a pass and in both directions.
 *
 * That is what lets the next pass tell a node the user edited from one merely
 * waiting to be overwritten. Taken after the writes, from the tree as it
 * actually is: a node that was just pushed to the server is settled at its
 * new title, and its stale siblings stay settled at the old one until the
 * outbound pass rewrites them.
 */
async function snapshotNodeTitles(
	api: BookmarksApi,
	barId: string
): Promise<void> {
	const mapping = await bookmarkMappingStorage.getValue();
	const mappedNodeIds = new Set([
		...Object.values(mapping.folderIdByCollectionId),
		...Object.values(mapping.bookmarkIdByLinkKey),
	]);

	const [bar] = await api.getSubTree(barId);
	const titleByNodeId = Object.fromEntries(
		[...indexBySubtreeId(bar?.children ?? [])]
			.filter(([nodeId]) => mappedNodeIds.has(nodeId))
			.map(([nodeId, node]) => [nodeId, node.title])
	);

	await bookmarkMappingStorage.setValue(withNodeTitles(mapping, titleByNodeId));
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

type InboundAdoption = { linkKey: string; nodeId: string };

/**
 * Settles every change instead of failing the batch on the first rejection:
 * one rate-limited write must not discard the adoptions the others earned,
 * or their nodes would be adopted again — and duplicated — next pass.
 */
async function pushInboundChanges(changes: InboundChange[]): Promise<{
	adoptions: InboundAdoption[];
	failedChangeCount: number;
}> {
	const outcomes = await runWithConcurrencyLimit(
		changes.map((change) => () => settleInboundChange(change)),
		MAX_CONCURRENT_BOOKMARK_WRITES
	);

	return {
		adoptions: outcomes.flatMap((outcome) =>
			outcome.adoption ? [outcome.adoption] : []
		),
		failedChangeCount: outcomes.filter((outcome) => outcome.hasFailed).length,
	};
}

async function settleInboundChange(change: InboundChange): Promise<{
	adoption: InboundAdoption | undefined;
	hasFailed: boolean;
}> {
	try {
		return { adoption: await pushInboundChange(change), hasFailed: false };
	} catch (error) {
		console.error(`MyLinks could not push a "${change.kind}" change`, error);
		return { adoption: undefined, hasFailed: true };
	}
}

async function pushInboundChange(
	change: InboundChange
): Promise<InboundAdoption | undefined> {
	switch (change.kind) {
		case 'create-link': {
			const createdLink = await createLink({
				name: change.name,
				url: change.url,
				favorite: false,
				collectionIds: [change.collectionId],
			});
			return {
				linkKey: buildLinkKey(change.collectionId, createdLink.id),
				nodeId: change.nodeId,
			};
		}
		case 'update-link':
			await updateLink(change.linkId, {
				name: change.name,
				url: change.url,
				description: change.description,
				favorite: change.favorite,
				collectionIds: change.collectionIds,
			});
			return undefined;
		case 'rename-collection':
			await updateCollection(change.collectionId, {
				name: change.name,
				description: change.description,
				visibility: change.visibility,
				icon: change.icon,
			});
			return undefined;
	}
}
