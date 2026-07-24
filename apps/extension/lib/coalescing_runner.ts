/**
 * Serialises a task, without ever losing a request for it.
 *
 * A plain "return early if busy" mutex drops whatever asked while the task was
 * running, which is wrong for anything that reconciles state: the request
 * exists precisely *because* the state changed, so discarding it leaves the
 * two sides out of sync until something else happens to trigger another run.
 * Here the request is remembered instead, and the task repeats once.
 *
 * Requests that pile up during a run collapse into that single repeat — the
 * task reads current state, so running it three times in a row would do the
 * same work three times.
 */
export function createCoalescingRunner(
	task: () => Promise<void>
): () => Promise<void> {
	let isRunning = false;
	let isRerunRequested = false;

	return async () => {
		// Assigned before the first `await`, so two calls landing in the same
		// tick can't both see `false` and run the task concurrently.
		if (isRunning) {
			isRerunRequested = true;
			return;
		}
		isRunning = true;

		try {
			do {
				isRerunRequested = false;
				await task();
			} while (isRerunRequested);
		} finally {
			isRunning = false;
		}
	};
}
