import { reconcile } from '@/lib/bookmarks/merge';
import { createLink, updateLink } from '@/lib/api/links';
import { updateCollection } from '@/lib/api/collections';
import { remapOrphanedNodes } from '@/lib/bookmarks/remap';
import type { CollectionWithLinks } from '@/lib/api/types';
import { runWithConcurrencyLimit } from '@/lib/concurrency';
import { syncCollections } from '@/lib/sync/sync_collections';
import type { ServerChange } from '@/lib/bookmarks/operations';
import { createCoalescingRunner } from '@/lib/coalescing_runner';
import { BOOKMARKS_PERMISSION } from '@/lib/bookmarks/constants';
import { fingerprintServerChanges } from '@/lib/bookmarks/change_fingerprint';
import {
	buildFolderReorder,
	buildLinkReorder,
} from '@/lib/bookmarks/collection_order';
import {
	applyBookmarkOperations,
	MAX_CONCURRENT_BOOKMARK_WRITES,
} from '@/lib/bookmarks/apply';
import {
	buildDesiredTree,
	buildLinkKey,
	type DesiredBookmark,
} from '@/lib/bookmarks/desired_tree';
import {
	getMappedFolderId,
	withMappedBookmark,
	type BookmarkMapping,
} from '@/lib/bookmarks/mapping';
import {
	getBrowserBookmarksApi,
	type BookmarkNode,
	type BookmarksApi,
} from '@/lib/bookmarks/bookmarks_api';
import {
	computeBackoffAfterFailure,
	INITIAL_SYNC_BACKOFF_STATE,
	isSyncBackingOff,
} from '@/lib/sync/backoff';
import {
	getOrCreateCollectionsFolder,
	resolveBookmarksBarId,
	type CollectionsFolderOrigin,
} from '@/lib/bookmarks/root';
import {
	buildPinnedLinkKey,
	buildPinnedReorder,
	collectFavoriteLinks,
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
	syncedTreeStorage,
} from '@/lib/storage';

/**
 * Reconciles the server's collections with the native bookmarks tree.
 *
 * One pass, both directions, no early exit: what each side changed is derived
 * against the snapshot of their last agreement, so the two halves cannot
 * argue with each other. Ordering the halves used to be the mechanism, and it
 * is what turned every ambiguity into an oscillation.
 *
 * Coalescing rather than a plain mutex: a request arriving mid-pass — the
 * cache write from the resync, a bookmark event, the alarm — is what carries
 * the mirror to its next state, and dropping it would strand the two sides
 * apart until an unrelated trigger happened along.
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
	// everything" and the plan would tear the mirror down.
	if (collectionsCache.fetchedAt === 0) {
		return;
	}

	const api = getBrowserBookmarksApi();
	const collectionsFolder = await getOrCreateCollectionsFolder(
		api,
		mirrorState.rootId
	);
	const collectionsFolderId = collectionsFolder.id;
	// A mirror enabled before this line shipped has no stamp: dating it from
	// now treats everything already saved as the user's own, rather than
	// claiming all of it at once.
	const savedSince = mirrorState.enabledAt ?? Date.now();
	if (
		collectionsFolderId !== mirrorState.rootId ||
		savedSince !== mirrorState.enabledAt
	) {
		await bookmarkMirrorStorage.setValue({
			...mirrorState,
			rootId: collectionsFolderId,
			enabledAt: savedSince,
		});
	}

	const barId = await resolveBookmarksBarId(api);
	const [bar] = await api.getSubTree(barId);
	const barChildren = bar?.children ?? [];
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

	const mapping = await claimOrphanedNodes(
		collectionsCache.collections,
		pinnedFavorites,
		mirrorState.rootOrigin,
		{ collectionsFolderId, barChildren }
	);

	const plan = reconcile({
		collections: collectionsCache.collections,
		collectionsFolderId,
		barId,
		barChildren,
		savedSince,
		mapping,
		snapshot: await syncedTreeStorage.getValue(),
	});

	await guardAgainstRepeatedPush(plan.serverChanges);

	const push = await pushServerChanges(plan.serverChanges, mapping);
	const applyResult = await applyBookmarkOperations(
		api,
		collectionsFolderId,
		plan.nativeOperations,
		push.mapping
	);
	await bookmarkMappingStorage.setValue(applyResult.mapping);

	const hasRefreshedCache = await confirmServerChanges(
		plan.serverChanges,
		collectionsCache.fetchedAt
	);

	if (wasRecomputed) {
		await applyPinnedOrder(api, barId, pinnedFavorites, applyResult.mapping);
	}
	await applyCollectionOrder(
		api,
		collectionsFolderId,
		collectionsCache.collections,
		applyResult.mapping
	);

	// The snapshot is what tells the next pass which side moved, so it may
	// only advance on a pass that fully landed. A write that failed leaves it
	// behind, and the next pass replays that write instead of reading the
	// state it never reached as a fresh user change.
	const failureCount =
		push.failedChangeCount + applyResult.failedOperationCount;
	if (failureCount === 0 && hasRefreshedCache) {
		await syncedTreeStorage.setValue({
			...plan.nextSnapshot,
			...applyResult.snapshot,
		});
		await rememberSettledTree();
		return;
	}

	throw new BookmarkMirrorError(
		failureCount > 0
			? `${failureCount} mirror operations failed`
			: 'Changes were pushed but the instance could not be reached to confirm them'
	);
}

/**
 * From here on the mirror has a tree of its own on this bar — it has just
 * settled one. Recorded only after a pass that fully landed, and it is what
 * later licenses claiming a node back by resemblance: a mirror that has never
 * written here has nothing to recognise, and every match would be the user's.
 */
async function rememberSettledTree(): Promise<void> {
	const mirrorState = await bookmarkMirrorStorage.getValue();
	if (mirrorState.rootOrigin === 'adopted') {
		return;
	}

	await bookmarkMirrorStorage.setValue({
		...mirrorState,
		rootOrigin: 'adopted',
	});
}

/**
 * Nodes the mirror created but can no longer recognise are claimed back before
 * anything is judged. Storage does not survive a reinstall while the bookmarks
 * do, and without this every one of them would be read as user content —
 * adopted into duplicate links, and shadowed by a second set of folders.
 *
 * Pins are only reclaimed once the mirror has a tree of its own here. Until
 * then it has left nothing on the bar to find, so a bookmark matching a
 * favourite's URL is one the user saved themselves — claiming it would put
 * their bookmark under MyLinks' control without them ever asking, down to
 * deleting it the day the link stops being a favourite.
 */
async function claimOrphanedNodes(
	collections: CollectionWithLinks[],
	pinnedFavorites: DesiredBookmark[],
	rootOrigin: CollectionsFolderOrigin | null,
	tree: { collectionsFolderId: string; barChildren: BookmarkNode[] }
): Promise<BookmarkMapping> {
	const storedMapping = await bookmarkMappingStorage.getValue();
	const mapping = remapOrphanedNodes({
		desiredFolders: buildDesiredTree(collections),
		pinnedBookmarks: pinnedFavorites,
		collectionsFolderChildren:
			tree.barChildren.find((child) => child.id === tree.collectionsFolderId)
				?.children ?? [],
		barChildren: tree.barChildren,
		mapping: storedMapping,
		rootOrigin,
	});

	if (mapping !== storedMapping) {
		await bookmarkMappingStorage.setValue(mapping);
	}
	return mapping;
}

/**
 * The merge is what makes a pass converge; this only catches the case where
 * that reasoning is wrong. A change that was written disappears from the next
 * pass, so seeing the same set twice means the server is not recording what
 * it is sent.
 */
async function guardAgainstRepeatedPush(
	serverChanges: ServerChange[]
): Promise<void> {
	if (serverChanges.length === 0) {
		await lastPushedChangesStorage.setValue(null);
		return;
	}

	if (
		fingerprintServerChanges(serverChanges) ===
		(await lastPushedChangesStorage.getValue())
	) {
		throw new BookmarkMirrorError(
			'The same changes came back after being pushed — the server is not recording them as sent'
		);
	}
}

/**
 * Refreshes the cache so the next pass judges the server by what it actually
 * stored. A resync that could not reach the instance leaves the fingerprint
 * unrecorded: re-finding the same changes then means the push was never
 * confirmed, not that the server refused it.
 */
async function confirmServerChanges(
	serverChanges: ServerChange[],
	previousFetchedAt: number
): Promise<boolean> {
	if (serverChanges.length === 0) {
		return true;
	}

	await syncCollections();
	const hasRefreshedCache =
		(await collectionsCacheStorage.getValue()).fetchedAt > previousFetchedAt;

	await lastPushedChangesStorage.setValue(
		hasRefreshedCache ? fingerprintServerChanges(serverChanges) : null
	);
	return hasRefreshedCache;
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

/**
 * Unlike the pinned bar, there is no local ranking to protect — server
 * `position` is the only source of order here, and the extension has no UI of
 * its own to compete with it, so this runs every pass rather than being
 * throttled to a recompute.
 */
async function applyCollectionOrder(
	api: BookmarksApi,
	collectionsFolderId: string,
	collections: CollectionWithLinks[],
	mapping: BookmarkMapping
): Promise<void> {
	const [collectionsFolder] = await api.getSubTree(collectionsFolderId);
	const folderChildren = collectionsFolder?.children ?? [];
	const folderNodeById = new Map(folderChildren.map((node) => [node.id, node]));

	const operations = [
		...buildFolderReorder(
			collections,
			collectionsFolderId,
			folderChildren,
			mapping
		),
		...collections.flatMap((collection) => {
			const folderNodeId = getMappedFolderId(mapping, collection.id);
			const folderNode = folderNodeId
				? folderNodeById.get(folderNodeId)
				: undefined;
			return folderNode
				? buildLinkReorder(
						collection,
						folderNode.id,
						folderNode.children ?? [],
						mapping
					)
				: [];
		}),
	];

	if (operations.length > 0) {
		await applyBookmarkOperations(
			api,
			collectionsFolderId,
			operations,
			mapping
		);
	}
}

/**
 * Settles every change instead of failing the batch on the first rejection:
 * one rate-limited write must not discard the adoptions the others earned,
 * or their nodes would be adopted again — and duplicated — next pass.
 */
async function pushServerChanges(
	changes: ServerChange[],
	mapping: BookmarkMapping
): Promise<{ mapping: BookmarkMapping; failedChangeCount: number }> {
	const outcomes = await runWithConcurrencyLimit(
		changes.map((change) => () => settleServerChange(change)),
		MAX_CONCURRENT_BOOKMARK_WRITES
	);

	const adoptions = outcomes.flatMap((outcome) =>
		outcome.adoption ? [outcome.adoption] : []
	);
	const nextMapping = adoptions.reduce(
		(current, adoption) =>
			withMappedBookmark(current, adoption.linkKey, adoption.nodeId),
		mapping
	);

	// Recorded before anything else can run: an adopted node that stays
	// unmapped is read as a user-added bookmark on the next pass and adopted
	// all over again, creating a duplicate link every time.
	if (adoptions.length > 0) {
		await bookmarkMappingStorage.setValue(nextMapping);
	}

	return {
		mapping: nextMapping,
		failedChangeCount: outcomes.filter((outcome) => outcome.hasFailed).length,
	};
}

type ServerAdoption = { linkKey: string; nodeId: string };

/**
 * The adopted node keeps its place, so it is mapped under the key that place
 * stands for. Filing a bar node as a folder copy would have the next pass
 * drag it into the folder, undoing the move the user just made by hand.
 */
function buildAdoptedLinkKey(
	change: Extract<ServerChange, { kind: 'create-link' }>,
	linkId: number
): string {
	if (change.placement === 'pinned') {
		return buildPinnedLinkKey(linkId);
	}
	return buildLinkKey(change.collectionId, linkId);
}

async function settleServerChange(change: ServerChange): Promise<{
	adoption: ServerAdoption | undefined;
	hasFailed: boolean;
}> {
	try {
		return { adoption: await pushServerChange(change), hasFailed: false };
	} catch (error) {
		console.error(`MyLinks could not push a "${change.kind}" change`, error);
		return { adoption: undefined, hasFailed: true };
	}
}

async function pushServerChange(
	change: ServerChange
): Promise<ServerAdoption | undefined> {
	switch (change.kind) {
		case 'create-link': {
			const createdLink = await createLink({
				name: change.name,
				url: change.url,
				favorite: change.favorite,
				collectionIds: [change.collectionId],
			});
			return {
				linkKey: buildAdoptedLinkKey(change, createdLink.id),
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
