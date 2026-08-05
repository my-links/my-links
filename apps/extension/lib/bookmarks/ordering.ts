import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';
import type { BookmarkOperation } from '@/lib/bookmarks/operations';

/**
 * A single `reorder-children` operation moving `actualChildren` into
 * `desiredNodeIds` order, or none if they already match.
 *
 * Nodes in `desiredNodeIds` that aren't (yet) present in `actualChildren` are
 * dropped rather than treated as a mismatch — the node may not exist yet, or
 * belong to a folder the caller isn't touching this pass. Nodes present in
 * `actualChildren` but absent from `desiredNodeIds` keep their spot instead of
 * being pushed to either end: the caller decides what counts as "desired",
 * and anything it left out is none of this function's business.
 */
export function buildReorderOperation(
	desiredNodeIds: string[],
	parentNodeId: string,
	actualChildren: BookmarkNode[]
): BookmarkOperation[] {
	const presentNodeIds = new Set(actualChildren.map((child) => child.id));
	const rankedNodeIds = desiredNodeIds.filter((nodeId) =>
		presentNodeIds.has(nodeId)
	);

	const actualOrder = actualChildren
		.filter((child) => rankedNodeIds.includes(child.id))
		.map((child) => child.id);

	const isAlreadyOrdered =
		actualOrder.length === rankedNodeIds.length &&
		actualOrder.every((nodeId, index) => nodeId === rankedNodeIds[index]);

	if (isAlreadyOrdered) {
		return [];
	}

	return [
		{ kind: 'reorder-children', parentNodeId, nodeIdsInOrder: rankedNodeIds },
	];
}
