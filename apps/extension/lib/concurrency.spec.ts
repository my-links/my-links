import { describe, expect, it } from 'vitest';

import { runWithConcurrencyLimit } from '@/lib/concurrency';

function buildTrackedTask(
	label: string,
	inFlight: { current: number; peak: number },
	completions: string[]
) {
	return async () => {
		inFlight.current += 1;
		inFlight.peak = Math.max(inFlight.peak, inFlight.current);
		await Promise.resolve();
		inFlight.current -= 1;
		completions.push(label);
		return label;
	};
}

describe('runWithConcurrencyLimit', () => {
	it('should never run more tasks at once than the limit allows', async () => {
		const inFlight = { current: 0, peak: 0 };
		const tasks = ['a', 'b', 'c', 'd', 'e'].map((label) =>
			buildTrackedTask(label, inFlight, [])
		);

		await runWithConcurrencyLimit(tasks, 2);

		expect(inFlight.peak).toBe(2);
	});

	it('should return results in the order the tasks were given', async () => {
		const inFlight = { current: 0, peak: 0 };
		const tasks = ['a', 'b', 'c'].map((label) =>
			buildTrackedTask(label, inFlight, [])
		);

		expect(await runWithConcurrencyLimit(tasks, 2)).toEqual(['a', 'b', 'c']);
	});

	it('should run every task even when the limit exceeds their count', async () => {
		const completions: string[] = [];
		const inFlight = { current: 0, peak: 0 };
		const tasks = ['a', 'b'].map((label) =>
			buildTrackedTask(label, inFlight, completions)
		);

		await runWithConcurrencyLimit(tasks, 10);

		expect(completions).toHaveLength(2);
	});

	it('should reject a limit below one rather than silently stalling', async () => {
		await expect(runWithConcurrencyLimit([], 0)).rejects.toThrow(RangeError);
	});
});
