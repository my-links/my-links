export const FIRST_RESULT_INDEX = 0;

export function nextResultIndex(
	currentIndex: number,
	resultCount: number
): number {
	if (resultCount === 0) {
		return FIRST_RESULT_INDEX;
	}

	return Math.min(currentIndex + 1, resultCount - 1);
}

export function previousResultIndex(currentIndex: number): number {
	return Math.max(currentIndex - 1, FIRST_RESULT_INDEX);
}
