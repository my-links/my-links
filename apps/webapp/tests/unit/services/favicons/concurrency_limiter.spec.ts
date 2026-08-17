import { test } from '@japa/runner';

import { ConcurrencyLimiter } from '#services/favicons/concurrency_limiter';

function deferred<TValue>() {
	let resolve!: (value: TValue) => void;
	const promise = new Promise<TValue>((res) => {
		resolve = res;
	});
	return { promise, resolve };
}

test.group('ConcurrencyLimiter.run', () => {
	test('should run tasks immediately while under the limit', async ({
		assert,
	}) => {
		const limiter = new ConcurrencyLimiter(2);
		const started: number[] = [];

		const first = deferred<void>();
		const second = deferred<void>();

		const firstRun = limiter.run(async () => {
			started.push(1);
			await first.promise;
		});
		const secondRun = limiter.run(async () => {
			started.push(2);
			await second.promise;
		});

		await Promise.resolve();
		assert.deepEqual(started, [1, 2]);

		first.resolve();
		second.resolve();
		await Promise.all([firstRun, secondRun]);
	});

	test('should queue a task beyond the limit until a slot frees up', async ({
		assert,
	}) => {
		const limiter = new ConcurrencyLimiter(1);
		const started: number[] = [];

		const first = deferred<void>();

		const firstRun = limiter.run(async () => {
			started.push(1);
			await first.promise;
		});
		const secondRun = limiter.run(async () => {
			started.push(2);
		});

		await Promise.resolve();
		assert.deepEqual(started, [1]);

		first.resolve();
		await Promise.all([firstRun, secondRun]);
		assert.deepEqual(started, [1, 2]);
	});

	test('should free the slot for the next task even when one throws', async ({
		assert,
	}) => {
		const limiter = new ConcurrencyLimiter(1);

		await assert.rejects(
			() =>
				limiter.run(() => {
					throw new Error('boom');
				}),
			'boom'
		);

		let secondRan = false;
		await limiter.run(async () => {
			secondRan = true;
		});

		assert.isTrue(secondRan);
	});
});
