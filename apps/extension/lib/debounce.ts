/**
 * Collapses a burst of calls into a single run, `delayMs` after the last one.
 *
 * Dragging a folder of bookmarks fires one event per node; reacting to each
 * would mean one full reconciliation per node. Waiting for the burst to
 * settle turns that into a single pass.
 */
export function createDebouncedTrigger(
	run: () => void,
	delayMs: number
): () => void {
	let pendingTimeout: ReturnType<typeof setTimeout> | undefined;

	return () => {
		if (pendingTimeout !== undefined) {
			clearTimeout(pendingTimeout);
		}
		pendingTimeout = setTimeout(() => {
			pendingTimeout = undefined;
			run();
		}, delayMs);
	};
}
