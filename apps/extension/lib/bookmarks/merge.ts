import { areSameBookmarkUrl } from '@/lib/bookmarks/url_match';
import { getDefaultCollectionId } from '@/lib/collections_tree';
import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';
import { getSyncedNode, type SyncedTree } from '@/lib/bookmarks/snapshot';
import { buildPinnedLinkKey, parsePinnedLinkKey } from '@/lib/bookmarks/pinned';
import {
	getMappedFolderId,
	type BookmarkMapping,
} from '@/lib/bookmarks/mapping';
import {
	buildDesiredFolder,
	buildLinkKey,
	parseLinkKey,
} from '@/lib/bookmarks/desired_tree';
import {
	indexBySubtreeId,
	isFolder,
	type BookmarkNode,
} from '@/lib/bookmarks/bookmarks_api';
import type {
	BookmarkOperation,
	NodePlacement,
	ServerChange,
} from '@/lib/bookmarks/operations';

export type ReconcileInput = {
	/** The server's answer, as last cached by the collections sync. */
	collections: CollectionWithLinks[];
	collectionsFolderId: string;
	barId: string;
	/** The bar's whole subtree — pins live on it, collections under a folder. */
	barChildren: BookmarkNode[];
	mapping: BookmarkMapping;
	snapshot: SyncedTree;
	/**
	 * When the mirror was switched on. Bookmarks that already existed are the
	 * user's own; only ones the browser created afterwards are read as pages
	 * they saved, which is what marks a link as a favourite.
	 */
	savedSince: number;
};

export type ReconcilePlan = {
	serverChanges: ServerChange[];
	nativeOperations: BookmarkOperation[];
	/**
	 * The state both sides will agree on once the plan has been applied, for
	 * every node whose id is already known. Nodes this plan creates are added
	 * by the executor, which is the first to learn their ids.
	 */
	nextSnapshot: SyncedTree;
};

/**
 * Works out, in one pass and in both directions, what has to change for the
 * browser and the server to agree again.
 *
 * Local and server changes are each derived against the snapshot rather than
 * against one another, so a side that has not moved is recognised as merely
 * behind instead of as an edit to push back. When both moved on the same
 * field, **the server wins**: it is the multi-device source of truth and the
 * webapp is the richer editor.
 *
 * Pure, and deliberately so — convergence is proved by applying a plan and
 * reconciling again, which has to come out empty.
 */
export function reconcile(input: ReconcileInput): ReconcilePlan {
	const context = buildMergeContext(input);
	const folders = planFolders(context);
	const links = planLinks(context, folders.removedCollectionIds);
	const adoptions = planAdoptions(context, folders.removedCollectionIds);

	return {
		serverChanges: [
			...folders.serverChanges,
			...links.serverChanges,
			...adoptions.serverChanges,
		],
		nativeOperations: [...folders.operations, ...links.operations],
		nextSnapshot: {
			...folders.snapshot,
			...links.snapshot,
			...adoptions.snapshot,
		},
	};
}

type MergeContext = {
	collectionsFolderId: string;
	barId: string;
	barChildren: BookmarkNode[];
	savedSince: number;
	collections: CollectionWithLinks[];
	mapping: BookmarkMapping;
	snapshot: SyncedTree;
	nodesById: Map<string, BookmarkNode>;
	collectionIdByFolderNodeId: Map<string, number>;
	/** Collections whose folder is on screen, so the tree can speak for them. */
	observableCollectionIds: Set<number>;
	linksById: Map<number, LinkResource>;
	mappedNodeIds: Set<string>;
};

function buildMergeContext(input: ReconcileInput): MergeContext {
	const nodesById = indexBySubtreeId(input.barChildren);
	const collectionIdByFolderNodeId = new Map(
		Object.entries(input.mapping.folderIdByCollectionId).map(
			([collectionId, nodeId]): [string, number] => [
				nodeId,
				Number(collectionId),
			]
		)
	);

	return {
		collectionsFolderId: input.collectionsFolderId,
		barId: input.barId,
		barChildren: input.barChildren,
		savedSince: input.savedSince,
		collections: input.collections,
		mapping: input.mapping,
		snapshot: input.snapshot,
		nodesById,
		collectionIdByFolderNodeId,
		observableCollectionIds: new Set(
			[...collectionIdByFolderNodeId]
				.filter(([nodeId]) => isPresentFolder(nodesById, nodeId))
				.map(([, collectionId]) => collectionId)
		),
		linksById: indexLinksById(input.collections),
		mappedNodeIds: new Set([
			...Object.values(input.mapping.folderIdByCollectionId),
			...Object.values(input.mapping.bookmarkIdByLinkKey),
		]),
	};
}

// ---------------------------------------------------------------------------
// Collection folders
// ---------------------------------------------------------------------------

type FolderPlan = {
	operations: BookmarkOperation[];
	serverChanges: ServerChange[];
	snapshot: SyncedTree;
	removedCollectionIds: Set<number>;
};

function planFolders(context: MergeContext): FolderPlan {
	const kept = context.collections.map((collection) =>
		planFolder(context, collection)
	);
	const removed = planRemovedFolders(context);

	return {
		operations: [
			...kept.flatMap((plan) => plan.operations),
			...removed.operations,
		],
		serverChanges: kept.flatMap((plan) => plan.serverChanges),
		snapshot: mergeSnapshots(kept.map((plan) => plan.snapshot)),
		removedCollectionIds: removed.collectionIds,
	};
}

function planFolder(
	context: MergeContext,
	collection: CollectionWithLinks
): Omit<FolderPlan, 'removedCollectionIds'> {
	const nodeId = getMappedFolderId(context.mapping, collection.id);
	const node = nodeId ? context.nodesById.get(nodeId) : undefined;

	if (!node || !isFolder(node)) {
		return {
			operations: [
				{ kind: 'create-folder', ...buildDesiredFolder(collection) },
			],
			serverChanges: [],
			snapshot: {},
		};
	}

	const title = decideFolderTitle(context, node, collection.name);
	return {
		operations: [
			...moveUnder(node, context.collectionsFolderId),
			...renameFolder(node, title.native),
		],
		serverChanges: buildRenameCollection(collection, title.pushedName),
		snapshot: {
			[node.id]: { parentId: context.collectionsFolderId, title: title.native },
		},
	};
}

type TitleDecision = { native: string; pushedName: string | undefined };

/**
 * The server's name unless the browser's is the only one that moved since the
 * snapshot — which is also how a two-sided rename resolves, the server winning
 * by default.
 */
function decideFolderTitle(
	context: MergeContext,
	node: BookmarkNode,
	serverTitle: string
): TitleDecision {
	const settledTitle = getSyncedNode(context.snapshot, node.id)?.title;

	if (settledTitle === undefined || serverTitle !== settledTitle) {
		return { native: serverTitle, pushedName: undefined };
	}
	if (node.title !== settledTitle) {
		return { native: node.title, pushedName: node.title };
	}
	return { native: serverTitle, pushedName: undefined };
}

function renameFolder(node: BookmarkNode, title: string): BookmarkOperation[] {
	if (node.title === title) {
		return [];
	}
	return [{ kind: 'rename-folder', nodeId: node.id, title }];
}

function buildRenameCollection(
	collection: CollectionWithLinks,
	pushedName: string | undefined
): ServerChange[] {
	if (pushedName === undefined) {
		return [];
	}
	return [
		{
			kind: 'rename-collection',
			collectionId: collection.id,
			name: pushedName,
			description: collection.description,
			visibility: collection.visibility,
			icon: collection.icon,
		},
	];
}

function planRemovedFolders(context: MergeContext): {
	operations: BookmarkOperation[];
	collectionIds: Set<number>;
} {
	const serverCollectionIds = new Set(
		context.collections.map((collection) => collection.id)
	);
	const removedEntries = Object.entries(context.mapping.folderIdByCollectionId)
		.map(([collectionId, nodeId]) => ({
			collectionId: Number(collectionId),
			nodeId,
		}))
		.filter(({ collectionId }) => !serverCollectionIds.has(collectionId));

	return {
		operations: removedEntries.flatMap((entry) =>
			planRemovedFolder(context, entry.collectionId, entry.nodeId)
		),
		collectionIds: new Set(removedEntries.map((entry) => entry.collectionId)),
	};
}

/**
 * A deleted collection takes its folder with it — but only when the mirror
 * created everything inside it. `removeTree` would take the user's own
 * bookmarks down with it, and nothing the mirror did not create may ever be
 * deleted, so a folder holding anything else is emptied of what belongs to
 * MyLinks and then simply handed over.
 */
function planRemovedFolder(
	context: MergeContext,
	collectionId: number,
	nodeId: string
): BookmarkOperation[] {
	const node = context.nodesById.get(nodeId);
	if (!node) {
		return [{ kind: 'forget-folder', collectionId }];
	}

	const ownedLinkKeyByNodeId = indexOwnedBookmarks(context, collectionId);
	const children = node.children ?? [];
	if (children.every((child) => ownedLinkKeyByNodeId.has(child.id))) {
		return [{ kind: 'remove-folder', nodeId, collectionId }];
	}

	return [
		...children.flatMap((child): BookmarkOperation[] => {
			const linkKey = ownedLinkKeyByNodeId.get(child.id);
			return linkKey
				? [{ kind: 'remove-bookmark', nodeId: child.id, linkKey }]
				: [];
		}),
		{ kind: 'forget-folder', collectionId },
	];
}

function indexOwnedBookmarks(
	context: MergeContext,
	collectionId: number
): Map<string, string> {
	return new Map(
		Object.entries(context.mapping.bookmarkIdByLinkKey)
			.filter(
				([linkKey]) => parseLinkKey(linkKey)?.collectionId === collectionId
			)
			.map(([linkKey, nodeId]): [string, string] => [nodeId, linkKey])
	);
}

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

type MappedLinkNode = {
	linkKey: string;
	nodeId: string;
	node: BookmarkNode | undefined;
	/** Collection whose folder holds the node right now, if any. */
	actualCollectionId: number | undefined;
	snapshotCollectionId: number | undefined;
	hasSnapshot: boolean;
};

type PinState = {
	linkKey: string;
	nodeId: string;
	node: BookmarkNode | undefined;
	hasSnapshot: boolean;
};

type LinkPlan = {
	operations: BookmarkOperation[];
	serverChanges: ServerChange[];
	snapshot: SyncedTree;
};

function planLinks(
	context: MergeContext,
	removedCollectionIds: Set<number>
): LinkPlan {
	const nodesByLinkId = collectMappedLinkNodes(context, removedCollectionIds);
	const pinsByLinkId = collectPinStates(context);
	const linkIds = [
		...new Set([
			...context.linksById.keys(),
			...nodesByLinkId.keys(),
			...pinsByLinkId.keys(),
		]),
	].sort((left, right) => left - right);

	const plans = linkIds.map((linkId) =>
		planLink(
			context,
			linkId,
			nodesByLinkId.get(linkId) ?? [],
			pinsByLinkId.get(linkId)
		)
	);

	return {
		operations: plans.flatMap((plan) => plan.operations),
		serverChanges: plans.flatMap((plan) => plan.serverChanges),
		snapshot: mergeSnapshots(plans.map((plan) => plan.snapshot)),
	};
}

/**
 * Nodes of collections being removed are left out entirely: their folder
 * removal already takes them, and asking for them twice would fail the pass.
 */
function collectMappedLinkNodes(
	context: MergeContext,
	removedCollectionIds: Set<number>
): Map<number, MappedLinkNode[]> {
	const nodesByLinkId = new Map<number, MappedLinkNode[]>();

	for (const [linkKey, nodeId] of Object.entries(
		context.mapping.bookmarkIdByLinkKey
	)) {
		const parsed = parseLinkKey(linkKey);
		if (!parsed || removedCollectionIds.has(parsed.collectionId)) {
			continue;
		}
		nodesByLinkId.set(parsed.linkId, [
			...(nodesByLinkId.get(parsed.linkId) ?? []),
			describeMappedLinkNode(context, linkKey, nodeId),
		]);
	}

	return nodesByLinkId;
}

function describeMappedLinkNode(
	context: MergeContext,
	linkKey: string,
	nodeId: string
): MappedLinkNode {
	const node = context.nodesById.get(nodeId);
	const syncedNode = getSyncedNode(context.snapshot, nodeId);

	return {
		linkKey,
		nodeId,
		node,
		actualCollectionId: node
			? context.collectionIdByFolderNodeId.get(node.parentId ?? '')
			: undefined,
		snapshotCollectionId: syncedNode
			? context.collectionIdByFolderNodeId.get(syncedNode.parentId)
			: undefined,
		hasSnapshot: syncedNode !== undefined,
	};
}

function collectPinStates(context: MergeContext): Map<number, PinState> {
	return new Map(
		Object.entries(context.mapping.bookmarkIdByLinkKey)
			.map(([linkKey, nodeId]): [number | undefined, PinState] => [
				parsePinnedLinkKey(linkKey),
				{
					linkKey,
					nodeId,
					node: context.nodesById.get(nodeId),
					hasSnapshot: getSyncedNode(context.snapshot, nodeId) !== undefined,
				},
			])
			.filter((entry): entry is [number, PinState] => entry[0] !== undefined)
	);
}

function planLink(
	context: MergeContext,
	linkId: number,
	mappedNodes: MappedLinkNode[],
	pin: PinState | undefined
): LinkPlan {
	const link = context.linksById.get(linkId);
	if (!link) {
		return dropLinkNodes(mappedNodes, pin);
	}

	const membership = decideMembership(context, link, mappedNodes);
	const placement = placeNodes(
		context,
		link.id,
		membership.targetCollectionIds,
		mappedNodes
	);
	const pinPlan = planPin(context, link, pin);
	const settledNodes = [...placement.settledNodes, ...pinPlan.settledNodes];
	const title = decideLinkTitle(context, link, settledNodes);
	const content = planNodeContents(settledNodes, title.native, link.url);

	// Creations come last so a node born this pass carries the title the pass
	// settled on, rather than the server's about-to-be-replaced one.
	const creations = [
		...placement.missingCollectionIds.map((collectionId) =>
			createBookmark(context, link.id, collectionId, title.native)
		),
		...(pinPlan.needsPin ? [createPin(context, link, title.native)] : []),
	];

	return {
		operations: [
			...placement.operations,
			...pinPlan.operations,
			...content.operations,
			...creations,
		],
		serverChanges: buildUpdateLink(link, {
			collectionIds: membership.pushedCollectionIds,
			name: title.pushedName,
			favorite: pinPlan.pushedFavorite,
		}),
		snapshot: content.snapshot,
	};
}

/** A link the server no longer has: its nodes go, nothing is pushed back. */
function dropLinkNodes(
	mappedNodes: MappedLinkNode[],
	pin: PinState | undefined
): LinkPlan {
	const pinNodes = pin ? [pin] : [];

	return {
		operations: [...mappedNodes, ...pinNodes].map(
			(mapped): BookmarkOperation =>
				mapped.node
					? {
							kind: 'remove-bookmark',
							nodeId: mapped.nodeId,
							linkKey: mapped.linkKey,
						}
					: { kind: 'forget-bookmark', linkKey: mapped.linkKey }
		),
		serverChanges: [],
		snapshot: {},
	};
}

// ---------------------------------------------------------------------------
// Membership
// ---------------------------------------------------------------------------

type MembershipDecision = {
	targetCollectionIds: number[];
	pushedCollectionIds: number[] | undefined;
};

/**
 * Which collections the link should end up in, and whether the server has to
 * be told.
 *
 * Memberships in collections with no folder on screen can't be judged from the
 * tree, so they are counted on both sides and cancel out rather than reading
 * as a removal.
 *
 * An empty local set is never pushed: the server re-files a link with no
 * collection under the Inbox, so the push would change nothing, come back as
 * the same difference, and loop. Removing a link's last bookmark is not a
 * detach — the outbound half of the pass puts the bookmark back.
 */
function decideMembership(
	context: MergeContext,
	link: LinkResource,
	mappedNodes: MappedLinkNode[]
): MembershipDecision {
	const unobservableIds = link.collectionIds.filter(
		(collectionId) => !context.observableCollectionIds.has(collectionId)
	);
	const serverIds = sortIds(link.collectionIds);
	const localIds = sortIds([
		...unobservableIds,
		...mappedNodes.flatMap((mapped) =>
			mapped.node && mapped.actualCollectionId !== undefined
				? [mapped.actualCollectionId]
				: []
		),
	]);
	const snapshotIds = sortIds([
		...unobservableIds,
		...mappedNodes.flatMap((mapped) =>
			mapped.snapshotCollectionId !== undefined
				? [mapped.snapshotCollectionId]
				: []
		),
	]);

	const isSettled =
		mappedNodes.length > 0 && mappedNodes.every((mapped) => mapped.hasSnapshot);
	const hasServerChange = !isSettled || !areSameIds(serverIds, snapshotIds);
	const hasLocalChange = !areSameIds(localIds, snapshotIds);

	if (hasServerChange || !hasLocalChange || localIds.length === 0) {
		return { targetCollectionIds: serverIds, pushedCollectionIds: undefined };
	}
	return { targetCollectionIds: localIds, pushedCollectionIds: localIds };
}

type SettledNode = { node: BookmarkNode; parentId: string };

type PlacementPlan = {
	operations: BookmarkOperation[];
	settledNodes: SettledNode[];
	/** Collections the link belongs to with no node left to reuse. */
	missingCollectionIds: number[];
};

/**
 * Files the link's existing nodes under the collections it should belong to,
 * reusing them wherever possible: a bookmark dragged between two folders is
 * the same bookmark, and deleting it to create it again would lose its
 * identity — and its place in the user's ordering — for nothing.
 *
 * A node that has been pulled out of the collections entirely is only reused
 * to spare a creation, never deleted: the user moved it somewhere they wanted
 * it, and the mirror does not follow them there.
 */
function placeNodes(
	context: MergeContext,
	linkId: number,
	targetCollectionIds: number[],
	mappedNodes: MappedLinkNode[]
): PlacementPlan {
	const targets = targetCollectionIds.filter((collectionId) =>
		context.observableCollectionIds.has(collectionId)
	);
	const present = mappedNodes.filter(
		(mapped): mapped is MappedLinkNode & { node: BookmarkNode } =>
			mapped.node !== undefined
	);

	const claimedNodeIds = new Set<string>();
	const assignments = targets.map((collectionId) => ({
		collectionId,
		mapped: claimNodeFor(collectionId, present, claimedNodeIds),
	}));

	return {
		operations: [
			...assignments.flatMap((assignment) =>
				assignment.mapped
					? refileNode(
							context,
							linkId,
							assignment.collectionId,
							assignment.mapped
						)
					: []
			),
			...releaseUnclaimedNodes(present, claimedNodeIds),
			...forgetVanishedNodes(mappedNodes),
		],
		settledNodes: assignments.flatMap((assignment) =>
			assignment.mapped
				? [
						{
							node: assignment.mapped.node,
							parentId: folderNodeIdOf(context, assignment.collectionId),
						},
					]
				: []
		),
		missingCollectionIds: assignments
			.filter((assignment) => !assignment.mapped)
			.map((assignment) => assignment.collectionId),
	};
}

type PresentLinkNode = MappedLinkNode & { node: BookmarkNode };

/** The node already sitting in that collection, else a homeless one, else any. */
function claimNodeFor(
	collectionId: number,
	present: PresentLinkNode[],
	claimedNodeIds: Set<string>
): PresentLinkNode | undefined {
	const available = present.filter(
		(mapped) => !claimedNodeIds.has(mapped.nodeId)
	);
	const claimed =
		available.find((mapped) => mapped.actualCollectionId === collectionId) ??
		available.find((mapped) => mapped.actualCollectionId === undefined) ??
		available[0];

	if (claimed) {
		claimedNodeIds.add(claimed.nodeId);
	}
	return claimed;
}

function refileNode(
	context: MergeContext,
	linkId: number,
	collectionId: number,
	mapped: PresentLinkNode
): BookmarkOperation[] {
	const folderNodeId = folderNodeIdOf(context, collectionId);
	const linkKey = buildLinkKey(collectionId, linkId);

	return [
		...moveUnder(mapped.node, folderNodeId),
		...(mapped.linkKey === linkKey
			? []
			: [
					{
						kind: 'remap-bookmark' as const,
						fromLinkKey: mapped.linkKey,
						toLinkKey: linkKey,
						nodeId: mapped.nodeId,
					},
				]),
	];
}

function createBookmark(
	context: MergeContext,
	linkId: number,
	collectionId: number,
	title: string
): BookmarkOperation {
	return {
		kind: 'create-bookmark',
		parentNodeId: folderNodeIdOf(context, collectionId),
		linkKey: buildLinkKey(collectionId, linkId),
		title,
		url: context.linksById.get(linkId)?.url ?? '',
	};
}

function releaseUnclaimedNodes(
	present: PresentLinkNode[],
	claimedNodeIds: Set<string>
): BookmarkOperation[] {
	return present
		.filter((mapped) => !claimedNodeIds.has(mapped.nodeId))
		.map((mapped): BookmarkOperation =>
			mapped.actualCollectionId === undefined
				? { kind: 'forget-bookmark', linkKey: mapped.linkKey }
				: {
						kind: 'remove-bookmark',
						nodeId: mapped.nodeId,
						linkKey: mapped.linkKey,
					}
		);
}

function forgetVanishedNodes(
	mappedNodes: MappedLinkNode[]
): BookmarkOperation[] {
	return mappedNodes
		.filter((mapped) => mapped.node === undefined)
		.map((mapped): BookmarkOperation => ({
			kind: 'forget-bookmark',
			linkKey: mapped.linkKey,
		}));
}

// ---------------------------------------------------------------------------
// Pinned favourites
// ---------------------------------------------------------------------------

type PinPlan = {
	operations: BookmarkOperation[];
	settledNodes: SettledNode[];
	pushedFavorite: boolean | undefined;
	needsPin: boolean;
};

/**
 * A pin on the bar *is* the favourite flag, so deleting one unfavourites the
 * link. Only a pin the mirror actually created can be read that way, and only
 * once it has settled: an unmapped or never-settled node says nothing about
 * the user's intent, and the server's flag stands.
 */
function planPin(
	context: MergeContext,
	link: LinkResource,
	pin: PinState | undefined
): PinPlan {
	if (!pin) {
		return { ...EMPTY_PIN_PLAN, needsPin: link.favorite };
	}

	const isUnpinnedByUser = pin.hasSnapshot && pin.node === undefined;
	if (isUnpinnedByUser) {
		return {
			...EMPTY_PIN_PLAN,
			operations: [{ kind: 'forget-bookmark', linkKey: pin.linkKey }],
			pushedFavorite: link.favorite ? false : undefined,
		};
	}
	if (!link.favorite) {
		return { ...EMPTY_PIN_PLAN, operations: [unpin(pin)] };
	}
	if (!pin.node) {
		return {
			...EMPTY_PIN_PLAN,
			operations: [{ kind: 'forget-bookmark', linkKey: pin.linkKey }],
			needsPin: true,
		};
	}

	return {
		...EMPTY_PIN_PLAN,
		operations: moveUnder(pin.node, context.barId),
		settledNodes: [{ node: pin.node, parentId: context.barId }],
	};
}

const EMPTY_PIN_PLAN: PinPlan = {
	operations: [],
	settledNodes: [],
	pushedFavorite: undefined,
	needsPin: false,
};

function createPin(
	context: MergeContext,
	link: LinkResource,
	title: string
): BookmarkOperation {
	return {
		kind: 'create-bookmark',
		parentNodeId: context.barId,
		linkKey: buildPinnedLinkKey(link.id),
		title,
		url: link.url,
	};
}

function unpin(pin: PinState): BookmarkOperation {
	if (!pin.node) {
		return { kind: 'forget-bookmark', linkKey: pin.linkKey };
	}
	return { kind: 'remove-bookmark', nodeId: pin.nodeId, linkKey: pin.linkKey };
}

// ---------------------------------------------------------------------------
// Titles and URLs
// ---------------------------------------------------------------------------

/**
 * A link can own several nodes — one per collection folder, plus a pin — and
 * they used to take turns pushing their own title back at each other forever.
 * They are judged together against the single title they were all settled on:
 * if none of them moved, the server's name wins; if one did, it wins and its
 * siblings are rewritten to match in the same pass.
 */
function decideLinkTitle(
	context: MergeContext,
	link: LinkResource,
	settledNodes: SettledNode[]
): TitleDecision {
	const settledTitle = findSettledTitle(context, settledNodes);
	if (settledTitle === undefined || link.name !== settledTitle) {
		return { native: link.name, pushedName: undefined };
	}

	const renamedNode = settledNodes.find(
		({ node }) => node.title !== settledTitle
	);
	if (!renamedNode) {
		return { native: link.name, pushedName: undefined };
	}
	return { native: renamedNode.node.title, pushedName: renamedNode.node.title };
}

/** The one title every node was left at, or nothing when they disagree. */
function findSettledTitle(
	context: MergeContext,
	settledNodes: SettledNode[]
): string | undefined {
	const titles = settledNodes.map(
		({ node }) => getSyncedNode(context.snapshot, node.id)?.title
	);
	const [first] = titles;

	if (first === undefined || titles.some((title) => title !== first)) {
		return undefined;
	}
	return first;
}

/**
 * URLs belong to the server, always. The two sides normalise them differently
 * and neither yields, so a difference can never be read as a user edit — a
 * URL is changed from the sidebar or the webapp, not from the bookmark
 * manager.
 */
function planNodeContents(
	settledNodes: SettledNode[],
	title: string,
	url: string
): { operations: BookmarkOperation[]; snapshot: SyncedTree } {
	const contents = settledNodes.map((settled) => {
		const needsRewrite =
			settled.node.title !== title ||
			!areSameBookmarkUrl(settled.node.url, url);

		return {
			settled,
			needsRewrite,
			finalUrl: needsRewrite ? url : settled.node.url,
		};
	});

	return {
		operations: contents
			.filter((content) => content.needsRewrite)
			.map((content) => ({
				kind: 'update-bookmark',
				nodeId: content.settled.node.id,
				title,
				url,
			})),
		snapshot: Object.fromEntries(
			contents.map((content) => [
				content.settled.node.id,
				{ parentId: content.settled.parentId, title, url: content.finalUrl },
			])
		),
	};
}

function buildUpdateLink(
	link: LinkResource,
	pushed: {
		collectionIds: number[] | undefined;
		name: string | undefined;
		favorite: boolean | undefined;
	}
): ServerChange[] {
	const hasChange =
		pushed.collectionIds !== undefined ||
		pushed.name !== undefined ||
		pushed.favorite !== undefined;

	if (!hasChange) {
		return [];
	}
	return [
		{
			kind: 'update-link',
			linkId: link.id,
			name: pushed.name ?? link.name,
			url: link.url,
			description: link.description,
			favorite: pushed.favorite ?? link.favorite,
			collectionIds: pushed.collectionIds ?? link.collectionIds,
		},
	];
}

// ---------------------------------------------------------------------------
// Adoption
// ---------------------------------------------------------------------------

/** A bookmark the user put anywhere the mirror owns becomes a link. */
function planAdoptions(
	context: MergeContext,
	removedCollectionIds: Set<number>
): { serverChanges: ServerChange[]; snapshot: SyncedTree } {
	const adoptions = [
		...context.collections
			.filter((collection) => !removedCollectionIds.has(collection.id))
			.flatMap((collection) => collectFiledNodes(context, collection.id)),
		...collectSavedOnBarNodes(context),
	];

	return {
		serverChanges: adoptions.map((adoption) =>
			buildAdoption(context, adoption)
		),
		snapshot: Object.fromEntries(
			adoptions.map(({ node }) => [
				node.id,
				{ parentId: node.parentId ?? '', title: node.title, url: node.url },
			])
		),
	};
}

/**
 * Saving a page and filing an existing bookmark are the same node in the same
 * folder, and only the browser's own dates tell them apart: a save creates a
 * node, a drag moves one and carries its original date along.
 *
 * The distinction matters because the star button cannot be pinned down by
 * place. Chromium files a new bookmark into the most recently modified folder
 * (`GetParentForNewNodes`), and the mirror writes into its own folders on
 * every pass — so it keeps making itself the target, and a saved page can
 * surface in any collection.
 */
function buildAdoption(
	context: MergeContext,
	{ collectionId, node, placement }: AdoptableNode
): ServerChange {
	return {
		kind: 'create-link',
		nodeId: node.id,
		collectionId,
		name: node.title,
		url: node.url ?? '',
		favorite: wasSavedByUser(context, node),
		placement,
	};
}

/** Created since the mirror was switched on, so the user saved it themselves. */
function wasSavedByUser(context: MergeContext, node: BookmarkNode): boolean {
	return node.dateAdded !== undefined && node.dateAdded > context.savedSince;
}

/** A bookmark inside a collection folder joins that collection. */
function collectFiledNodes(
	context: MergeContext,
	collectionId: number
): AdoptableNode[] {
	const folderNodeId = getMappedFolderId(context.mapping, collectionId);
	const folder = folderNodeId ? context.nodesById.get(folderNodeId) : undefined;

	return (folder?.children ?? [])
		.filter((child) => isAdoptable(context, child))
		.map((node) => ({ collectionId, node, placement: 'filed' as const }));
}

/**
 * A bookmark on the bar itself joins the default collection, and is kept as
 * the link's pin — the bar is where pins live, so leaving it anywhere else
 * would move it out from under the user.
 *
 * Only ones saved since the mirror was switched on: the bar was the user's
 * long before MyLinks had any say over it, and adopting what it already held
 * would import their whole bar into the account.
 */
function collectSavedOnBarNodes(context: MergeContext): AdoptableNode[] {
	const defaultCollectionId = getDefaultCollectionId(context.collections);
	if (defaultCollectionId === undefined) {
		return [];
	}

	return context.barChildren
		.filter(
			(child) => isAdoptable(context, child) && wasSavedByUser(context, child)
		)
		.map((node) => ({
			collectionId: defaultCollectionId,
			node,
			placement: 'pinned' as const,
		}));
}

type AdoptableNode = {
	collectionId: number;
	node: BookmarkNode;
	placement: NodePlacement;
};

function isAdoptable(context: MergeContext, node: BookmarkNode): boolean {
	return node.url !== undefined && !context.mappedNodeIds.has(node.id);
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function moveUnder(
	node: BookmarkNode,
	parentNodeId: string
): BookmarkOperation[] {
	if (node.parentId === parentNodeId) {
		return [];
	}
	return [{ kind: 'move-node', nodeId: node.id, parentNodeId }];
}

function folderNodeIdOf(context: MergeContext, collectionId: number): string {
	return getMappedFolderId(context.mapping, collectionId) ?? '';
}

function isPresentFolder(
	nodesById: Map<string, BookmarkNode>,
	nodeId: string
): boolean {
	const node = nodesById.get(nodeId);
	return node !== undefined && isFolder(node);
}

function indexLinksById(
	collections: CollectionWithLinks[]
): Map<number, LinkResource> {
	return new Map(
		collections.flatMap((collection) =>
			(collection.links ?? []).map((link): [number, LinkResource] => [
				link.id,
				link,
			])
		)
	);
}

function mergeSnapshots(snapshots: SyncedTree[]): SyncedTree {
	return snapshots.reduce<SyncedTree>(
		(merged, snapshot) => ({ ...merged, ...snapshot }),
		{}
	);
}

function sortIds(ids: number[]): number[] {
	return [...new Set(ids)].sort((left, right) => left - right);
}

function areSameIds(left: number[], right: number[]): boolean {
	return (
		left.length === right.length &&
		left.every((id, index) => id === right[index])
	);
}
