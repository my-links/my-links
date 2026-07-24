import { describe, expect, it } from 'vitest';

import { createCoalescingRunner } from '@/lib/coalescing_runner';

function createControllableTask() {
	const resolvers: (() => void)[] = [];
	let runCount = 0;

	const task = () => {
		runCount += 1;
		return new Promise<void>((resolve) => resolvers.push(resolve));
	};

	return {
		task,
		getRunCount: () => runCount,
		finishCurrentRun: async () => {
			resolvers.shift()?.();
			await Promise.resolve();
			await Promise.resolve();
		},
	};
}

describe('createCoalescingRunner', () => {
	it('should run the task once when nothing else asks for it', async () => {
		const { task, getRunCount, finishCurrentRun } = createControllableTask();
		const run = createCoalescingRunner(task);

		const pending = run();
		await finishCurrentRun();
		await pending;

		expect(getRunCount()).toBe(1);
	});

	it('should repeat the task for a request that arrived while it was running', async () => {
		const { task, getRunCount, finishCurrentRun } = createControllableTask();
		const run = createCoalescingRunner(task);

		const pending = run();
		void run();
		await finishCurrentRun();

		expect(getRunCount()).toBe(2);

		await finishCurrentRun();
		await pending;
	});

	it('should collapse a burst of requests into a single repeat', async () => {
		const { task, getRunCount, finishCurrentRun } = createControllableTask();
		const run = createCoalescingRunner(task);

		const pending = run();
		void run();
		void run();
		void run();
		await finishCurrentRun();
		await finishCurrentRun();
		await pending;

		expect(getRunCount()).toBe(2);
	});

	it('should never run two tasks at once', async () => {
		let concurrentRuns = 0;
		let peakConcurrentRuns = 0;
		const run = createCoalescingRunner(async () => {
			concurrentRuns += 1;
			peakConcurrentRuns = Math.max(peakConcurrentRuns, concurrentRuns);
			await Promise.resolve();
			concurrentRuns -= 1;
		});

		await Promise.all([run(), run(), run()]);

		expect(peakConcurrentRuns).toBe(1);
	});

	it('should accept new requests after a failed run instead of wedging', async () => {
		let runCount = 0;
		const run = createCoalescingRunner(async () => {
			runCount += 1;
			throw new Error('mirror failed');
		});

		await expect(run()).rejects.toThrow('mirror failed');
		await expect(run()).rejects.toThrow('mirror failed');

		expect(runCount).toBe(2);
	});
});
