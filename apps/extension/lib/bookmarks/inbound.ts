import { parseLinkKey } from '@/lib/bookmarks/desired_tree';
import type { BookmarkMapping } from '@/lib/bookmarks/mapping';
import { isFolder, type BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import type {
	CollectionVisibility,
	CollectionWithLinks,
	LinkResource,
} from '@/lib/api/types';

export type InboundChange =
	| { kind: 'create-link'; collectionId: number; name: string; url: string }
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

/**
 * Reads the native tree back and works out what the server should be told.
 *
 * Deliberately a full reconciliation rather than a replay of bookmark
 * events: the mirror's own writes fire the same events a user's edits do, and
 * comparing states means anything MyLinks just wrote simply produces no
 * change. It also survives events missed while the MV3 service worker was
 * asleep.
 *
 * Two things are pointedly *not* propagated. A collection folder that has
 * vanished does not delete the collection — a stray drag would otherwise
 * destroy a whole collection, and the outbound pass just puts the folder
 * back. Sub-folders nested inside a collection folder are ignored: the
 * mirror is one level deep, and there is nothing on the server to map them
 * onto.
 */
export function detectInboundChanges(
	collections: CollectionWithLinks[],
	rootChildren: BookmarkNode[],
	mapping: BookmarkMapping
): InboundChange[] {
	const observedFolders = collectObservedFolders(rootChildren, mapping);
	const observedNodes = collectObservedNodes(observedFolders);

	return [
		...detectRenamedCollections(collections, observedFolders),
		...detectAdoptedBookmarks(observedNodes, mapping),
		...detectLinkChanges(collections, observedNodes, observedFolders, mapping),
	];
}

/** Mapped collection folders that are actually present under the root. */
function collectObservedFolders(
	rootChildren: BookmarkNode[],
	mapping: BookmarkMapping
): Map<number, BookmarkNode> {
	const nodesById = new Map(rootChildren.map((node) => [node.id, node]));

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

function detectRenamedCollections(
	collections: CollectionWithLinks[],
	observedFolders: Map<number, BookmarkNode>
): InboundChange[] {
	return collections
		.filter((collection) => {
			const folder = observedFolders.get(collection.id);
			return folder !== undefined && folder.title !== collection.name;
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
			collectionId,
			name: node.title,
			url: node.url ?? '',
		}));
}

/**
 * One update per link, never one per node: a link dragged out of two folders
 * at once has to produce a single membership payload, or the second write
 * would undo the first.
 */
function detectLinkChanges(
	collections: CollectionWithLinks[],
	observedNodes: ObservedNode[],
	observedFolders: Map<number, BookmarkNode>,
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

	return [...groupMappedNodesByLinkId(mapping)]
		.map(([linkId, mappedNodes]) =>
			buildLinkChange(
				linksById.get(linkId),
				mappedNodes,
				nodesByNodeId,
				observableCollectionIds
			)
		)
		.filter((change): change is InboundChange => change !== undefined);
}

function buildLinkChange(
	link: LinkResource | undefined,
	mappedNodes: { collectionId: number; nodeId: string }[],
	nodesByNodeId: Map<string, ObservedNode>,
	observableCollectionIds: Set<number>
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
	const nextCollectionIds = [
		...new Set([
			...unobservableCollectionIds,
			...presentNodes.map(({ collectionId }) => collectionId),
		]),
	].sort((left, right) => left - right);

	const editedNode = presentNodes.find(
		({ node }) => node.title !== link.name || node.url !== link.url
	);

	const hasMembershipChange = !areSameIds(
		nextCollectionIds,
		link.collectionIds
	);
	if (!hasMembershipChange && !editedNode) {
		return undefined;
	}

	return {
		kind: 'update-link',
		linkId: link.id,
		name: editedNode?.node.title ?? link.name,
		url: editedNode?.node.url ?? link.url,
		description: link.description,
		favorite: link.favorite,
		collectionIds: nextCollectionIds,
	};
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
