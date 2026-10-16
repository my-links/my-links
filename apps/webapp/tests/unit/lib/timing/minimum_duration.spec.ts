import { test } from '@japa/runner';

import { padToMinimumDuration, type Clock } from '#lib/timing/minimum_duration';

const FLOOR_MILLISECONDS = 750;

function buildClock(currentTime: number): {
	clock: Clock;
	sleeps: number[];
} {
	const sleeps: number[] = [];
	const clock: Clock = {
		now: () => currentTime,
		sleep: async (milliseconds) => {
			sleeps.push(milliseconds);
		},
	};

	return { clock, sleeps };
}

test.group('padToMinimumDuration', () => {
	test('should sleep for the time left before the floor', async ({
		assert,
	}) => {
		const { clock, sleeps } = buildClock(200);

		await padToMinimumDuration(0, FLOOR_MILLISECONDS, clock);

		assert.deepEqual(sleeps, [550]);
	});

	test('should not sleep once the floor has already passed', async ({
		assert,
	}) => {
		const { clock, sleeps } = buildClock(900);

		await padToMinimumDuration(0, FLOOR_MILLISECONDS, clock);

		assert.deepEqual(sleeps, []);
	});

	test('should not sleep when the floor is exactly reached', async ({
		assert,
	}) => {
		const { clock, sleeps } = buildClock(FLOOR_MILLISECONDS);

		await padToMinimumDuration(0, FLOOR_MILLISECONDS, clock);

		assert.deepEqual(sleeps, []);
	});
});
