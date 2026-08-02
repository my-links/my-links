import type { SearchResult } from '@/lib/api/types';

export const FIRST_RESULT_INDEX = 0;

/**
 * What the search panel actually renders. Keyboard selection indexes into this
 * list, so it has to be the single source of truth for both rendering and
 * navigation — a result that renders nothing would otherwise eat an index and
 * strand the selection on a row the user cannot see.
 */
export function buildDisplayedResults(results: SearchResult[]): SearchResult[] {
	return results.filter((result) => Boolean(result.url));
}

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
