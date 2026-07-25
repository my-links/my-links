/**
 * The state the browser and the server were last agreed on — Floccus calls it
 * the cache tree.
 *
 * Without it, a mirror pass can only compare the native node to the server and
 * learn that the two disagree, never which of them moved. Every disagreement
 * then reads as a user edit, gets pushed, gets rewritten or ignored by the
 * server, and comes straight back: five separate runaway loops shipped that
 * way before this existed.
 *
 * Against a snapshot the question has an answer. A side that still matches it
 * has not moved — it is merely behind, and gets overwritten without a say. A
 * side that differs from it has moved. Both differing is a real conflict,
 * settled by an explicit rule instead of by which half of the pass ran first.
 *
 * Only ever advanced after a pass that succeeded in full: a write that failed
 * leaves the snapshot behind, so the next pass replays it rather than mistaking
 * the unwritten state for a fresh change.
 */
export type SyncedNode = {
	parentId: string;
	title: string;
	url?: string;
};

/** Keyed by native node id — the only identifier both sides of a pass share. */
export type SyncedTree = Record<string, SyncedNode>;

export const EMPTY_SYNCED_TREE: SyncedTree = {};

export function getSyncedNode(
	tree: SyncedTree,
	nodeId: string
): SyncedNode | undefined {
	return tree[nodeId];
}
