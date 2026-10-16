export type Clock = {
	readonly now: () => number;
	readonly sleep: (milliseconds: number) => Promise<void>;
};

export const SYSTEM_CLOCK: Clock = {
	now: () => performance.now(),
	sleep: (milliseconds) =>
		new Promise((resolve) => setTimeout(resolve, milliseconds)),
};

/**
 * Waits out whatever is left of `floorMilliseconds` since `startedAt`, so work
 * that finishes early is indistinguishable from work that did not.
 */
export async function padToMinimumDuration(
	startedAt: number,
	floorMilliseconds: number,
	clock: Clock = SYSTEM_CLOCK
): Promise<void> {
	const remainingMilliseconds = floorMilliseconds - (clock.now() - startedAt);
	if (remainingMilliseconds <= 0) return;

	await clock.sleep(remainingMilliseconds);
}
