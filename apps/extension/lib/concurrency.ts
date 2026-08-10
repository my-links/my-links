/**
 * Runs tasks with at most `limit` of them in flight, preserving result order.
 *
 * The native bookmarks API serialises writes internally and fires an event
 * per change; firing dozens at once is what made the previous extension
 * stutter. A small window keeps the mirror quick without flooding the
 * browser.
 */
export async function runWithConcurrencyLimit<TResult>(
	tasks: (() => Promise<TResult>)[],
	limit: number
): Promise<TResult[]> {
	if (limit < 1) {
		throw new RangeError('Concurrency limit must be at least 1.');
	}

	const results: TResult[] = Array.from({ length: tasks.length });
	let nextTaskIndex = 0;

	const runNextTask = async (): Promise<void> => {
		while (nextTaskIndex < tasks.length) {
			const taskIndex = nextTaskIndex;
			nextTaskIndex += 1;
			const task = tasks[taskIndex];
			if (!task) {
				continue;
			}
			results[taskIndex] = await task();
		}
	};

	const workerCount = Math.min(limit, tasks.length);
	await Promise.all(Array.from({ length: workerCount }, () => runNextTask()));

	return results;
}
