import { parseLinkKey } from '@/lib/bookmarks/desired_tree';
import { parsePinnedLinkKey } from '@/lib/bookmarks/pinned';
import {
	getSnapshotTitle,
	type BookmarkMapping,
} from '@/lib/bookmarks/mapping';
import {
	indexBySubtreeId,
	isFolder,
	type BookmarkNode,
} from '@/lib/bookmarks/bookmarks_api';
import type {
	CollectionVisibility,
	CollectionWithLinks,
	LinkResource,
} from '@/lib/api/types';

export type InboundChange =
	| {
			kind: 'create-link';
			/** Native node being adopted — mapped to the new link once created. */
			nodeId: string;
			collectionId: number;
			name: string;
			url: string;
	  }
	| {
			kind: 'update-link';
			linkId: number;
			name: string;
			url: string;
			description: string | null;
			favorite: boolean;
			collectionIds: number[];
	  }
	| {
			kind: 'rename-collection';
			collectionId: number;
			name: string;
			description: string | null;
			visibility: CollectionVisibility;
			icon: string | null;
	  };

type ObservedNode = {
	collectionId: number;
	node: BookmarkNode;
};

type PinObservation = {
	isMapped: boolean;
	node: BookmarkNode | undefined;
};

/**
 * Reads the native tree back and works out what the server should be told.
 *
 * Deliberately a full reconciliation rather than a replay of bookmark events:
 * the mirror's own writes fire the same events a user's edits do, and
 * comparing states means anything MyLinks just wrote simply produces no
 * change. It also survives events missed while the MV3 service worker was
 * asleep.
 *
 * Two things are pointedly *not* propagated. A collection folder that has
 * vanished does not delete the collection — a stray drag would otherwise
 * destroy a whole collection, and the outbound pass just puts the folder
 * back. Sub-folders nested inside a collection folder are ignored: the mirror
 * is one level deep, and there is nothing on the server to map them onto.
 */
export function detectInboundChanges(
	collections: CollectionWithLinks[],
	collectionsFolderChildren: BookmarkNode[],
	barChildren: BookmarkNode[],
	mapping: BookmarkMapping
): InboundChange[] {
	const observedFolders = collectObservedFolders(
		collectionsFolderChildren,
		mapping
	);
	const observedNodes = collectObservedNodes(observedFolders);

	return [
		...detectRenamedCollections(collections, observedFolders, mapping),
		...detectAdoptedBookmarks(observedNodes, mapping),
		...detectLinkChanges(
			collections,
			observedNodes,
			observedFolders,
			collectPinObservations(barChildren, mapping),
			mapping
		),
	];
}

/** Mapped collection folders actually present inside the Collections folder. */
function collectObservedFolders(
	collectionsFolderChildren: BookmarkNode[],
	mapping: BookmarkMapping
): Map<number, BookmarkNode> {
	const nodesById = new Map(
		collectionsFolderChildren.map((node) => [node.id, node])
	);

	return new Map(
		Object.entries(mapping.folderIdByCollectionId)
			.map(([collectionId, nodeId]): [number, BookmarkNode | undefined] => [
				Number(collectionId),
				nodesById.get(nodeId),
			])
			.filter((entry): entry is [number, BookmarkNode] => {
				const [, node] = entry;
				return node !== undefined && isFolder(node);
			})
	);
}

function collectObservedNodes(
	observedFolders: Map<number, BookmarkNode>
): ObservedNode[] {
	return [...observedFolders].flatMap(([collectionId, folder]) =>
		(folder.children ?? [])
			.filter((child) => child.url !== undefined)
			.map((child) => ({ collectionId, node: child }))
	);
}

/**
 * Where each pinned link's node stands right now. `isMapped` matters as much
 * as the node: a link the mirror has never pinned must keep the server's
 * favourite flag, rather than being read as "the user removed its pin".
 *
 * Searched across the bar's whole subtree, deliberately: a pin dragged into a
 * folder — or left inside one by an older layout — is misplaced, not deleted.
 * Matching only the bar's top level would unfavourite it, and since this pass
 * runs before the outbound one, nothing would ever get to move it back.
 */
function collectPinObservations(
	barNodes: BookmarkNode[],
	mapping: BookmarkMapping
): Map<number, PinObservation> {
	const barNodesById = indexBySubtreeId(barNodes);

	return new Map(
		Object.entries(mapping.bookmarkIdByLinkKey)
			.map(([linkKey, nodeId]): [number | undefined, PinObservation] => [
				parsePinnedLinkKey(linkKey),
				{ isMapped: true, node: barNodesById.get(nodeId) },
			])
			.filter((entry): entry is [number, PinObservation] => {
				const [linkId] = entry;
				return linkId !== undefined;
			})
	);
}

function detectRenamedCollections(
	collections: CollectionWithLinks[],
	observedFolders: Map<number, BookmarkNode>,
	mapping: BookmarkMapping
): InboundChange[] {
	return collections
		.filter((collection) => {
			const folder = observedFolders.get(collection.id);
			return (
				folder !== undefined && isRenamedNode(folder, collection.name, mapping)
			);
		})
		.map((collection) => ({
			kind: 'rename-collection',
			collectionId: collection.id,
			name: observedFolders.get(collection.id)?.title ?? collection.name,
			description: collection.description,
			visibility: collection.visibility,
			icon: collection.icon,
		}));
}

/** A bookmark the user dropped into a collection folder becomes a link. */
function detectAdoptedBookmarks(
	observedNodes: ObservedNode[],
	mapping: BookmarkMapping
): InboundChange[] {
	const mappedNodeIds = new Set(Object.values(mapping.bookmarkIdByLinkKey));

	return observedNodes
		.filter(({ node }) => !mappedNodeIds.has(node.id))
		.map(({ collectionId, node }) => ({
			kind: 'create-link',
			nodeId: node.id,
			collectionId,
			name: node.title,
			url: node.url ?? '',
		}));
}

/**
 * One update per link, never one per node: a link dragged out of two folders
 * at once — or out of a folder *and* off the bar — has to produce a single
 * payload, or the second write would undo the first.
 */
function detectLinkChanges(
	collections: CollectionWithLinks[],
	observedNodes: ObservedNode[],
	observedFolders: Map<number, BookmarkNode>,
	pinObservations: Map<number, PinObservation>,
	mapping: BookmarkMapping
): InboundChange[] {
	const linksById = indexLinksById(collections);
	const nodesByNodeId = new Map(
		observedNodes.map(({ collectionId, node }) => [
			node.id,
			{ collectionId, node },
		])
	);
	const observableCollectionIds = new Set(observedFolders.keys());
	const mappedNodesByLinkId = groupMappedNodesByLinkId(mapping);

	const touchedLinkIds = new Set([
		...mappedNodesByLinkId.keys(),
		...pinObservations.keys(),
	]);

	return [...touchedLinkIds]
		.map((linkId) =>
			buildLinkChange(
				linksById.get(linkId),
				mappedNodesByLinkId.get(linkId) ?? [],
				pinObservations.get(linkId),
				nodesByNodeId,
				observableCollectionIds,
				mapping
			)
		)
		.filter((change): change is InboundChange => change !== undefined);
}

function buildLinkChange(
	link: LinkResource | undefined,
	mappedNodes: { collectionId: number; nodeId: string }[],
	pinObservation: PinObservation | undefined,
	nodesByNodeId: Map<string, ObservedNode>,
	observableCollectionIds: Set<number>,
	mapping: BookmarkMapping
): InboundChange | undefined {
	if (!link) {
		return undefined;
	}

	const presentNodes = mappedNodes.flatMap((mappedNode) => {
		const observed = nodesByNodeId.get(mappedNode.nodeId);
		return observed ? [observed] : [];
	});

	// Memberships in collections with no folder on screen can't be judged
	// from the tree, so they are carried over untouched.
	const unobservableCollectionIds = link.collectionIds.filter(
		(collectionId) => !observableCollectionIds.has(collectionId)
	);
	const observedCollectionIds = [
		...new Set([
			...unobservableCollectionIds,
			...presentNodes.map(({ collectionId }) => collectionId),
		]),
	].sort((left, right) => left - right);

	// A link always has a home: the server re-files an empty set under the
	// Inbox. Pushing one would therefore change nothing, be read back as the
	// same difference, and loop forever — so removing a link's last bookmark
	// is not a detach. The outbound pass puts the bookmark back.
	const nextCollectionIds =
		observedCollectionIds.length > 0
			? observedCollectionIds
			: link.collectionIds;

	// Deleting a pin is how the bar unfavourites a link. Only a link the
	// mirror actually pinned can be read that way; for anything else the
	// server's flag stands.
	const nextFavorite = pinObservation?.isMapped
		? pinObservation.node !== undefined
		: link.favorite;

	const renamedNode =
		presentNodes.find(({ node }) => isRenamedNode(node, link.name, mapping))
			?.node ?? findRenamedPin(pinObservation, link, mapping);

	const hasMembershipChange = !areSameIds(
		nextCollectionIds,
		link.collectionIds
	);
	const hasFavoriteChange = nextFavorite !== link.favorite;
	if (!hasMembershipChange && !hasFavoriteChange && !renamedNode) {
		return undefined;
	}

	return {
		kind: 'update-link',
		linkId: link.id,
		name: renamedNode?.title ?? link.name,
		// The server's own URL, never the browser's. The two normalise
		// differently and neither yields — the API strips `www.` and trailing
		// slashes, the browser puts a slash back — so a URL difference cannot
		// be read as a user edit: pushing the browser's form gets rewritten,
		// re-detected, and pushed again forever. The server owns URLs, and the
		// outbound pass rewrites the bookmark to match. A URL is edited from
		// the sidebar or the webapp, not from the bookmark manager.
		url: link.url,
		description: link.description,
		favorite: nextFavorite,
		collectionIds: nextCollectionIds,
	};
}

function findRenamedPin(
	pinObservation: PinObservation | undefined,
	link: LinkResource,
	mapping: BookmarkMapping
): BookmarkNode | undefined {
	const pinnedNode = pinObservation?.node;
	if (!pinnedNode) {
		return undefined;
	}
	return isRenamedNode(pinnedNode, link.name, mapping) ? pinnedNode : undefined;
}

/**
 * Renamed by the user, as opposed to merely out of date. With no snapshot yet
 * the server's own value stands in, so a node the mirror has never settled is
 * never mistaken for an edit.
 */
function isRenamedNode(
	node: BookmarkNode,
	serverName: string,
	mapping: BookmarkMapping
): boolean {
	return node.title !== (getSnapshotTitle(mapping, node.id) ?? serverName);
}

function groupMappedNodesByLinkId(
	mapping: BookmarkMapping
): Map<number, { collectionId: number; nodeId: string }[]> {
	const mappedNodesByLinkId = new Map<
		number,
		{ collectionId: number; nodeId: string }[]
	>();

	for (const [linkKey, nodeId] of Object.entries(mapping.bookmarkIdByLinkKey)) {
		const parsed = parseLinkKey(linkKey);
		if (!parsed) {
			continue;
		}
		mappedNodesByLinkId.set(parsed.linkId, [
			...(mappedNodesByLinkId.get(parsed.linkId) ?? []),
			{ collectionId: parsed.collectionId, nodeId },
		]);
	}

	return mappedNodesByLinkId;
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

function areSameIds(left: number[], right: number[]): boolean {
	const sortedRight = [...right].sort((first, second) => first - second);
	return (
		left.length === sortedRight.length &&
		left.every((id, index) => id === sortedRight[index])
	);
}
