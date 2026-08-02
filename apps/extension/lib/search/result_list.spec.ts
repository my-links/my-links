import { describe, expect, it } from 'vitest';

import type { SearchResult } from '@/lib/api/types';
import {
	buildDisplayedResults,
	FIRST_RESULT_INDEX,
	nextResultIndex,
	previousResultIndex,
} from '@/lib/search/result_list';

function buildLinkResult(overrides: Partial<SearchResult> = {}): SearchResult {
	return {
		id: 1,
		name: 'A link',
		type: 'link',
		url: 'https://example.com',
		icon: null,
		matchedPart: null,
		rank: null,
		...overrides,
	};
}

describe('buildDisplayedResults', () => {
	it('should keep link results that have a url', () => {
		const link = buildLinkResult();

		expect(buildDisplayedResults([link])).toEqual([link]);
	});

	it('should keep the order the server returned', () => {
		const firstLink = buildLinkResult({ id: 1 });
		const secondLink = buildLinkResult({ id: 2 });

		expect(buildDisplayedResults([firstLink, secondLink])).toEqual([
			firstLink,
			secondLink,
		]);
	});

	it('should drop results without a url since they render nothing', () => {
		const linkWithoutUrl = buildLinkResult({ id: 3, url: null });

		expect(buildDisplayedResults([linkWithoutUrl])).toEqual([]);
	});
});

describe('nextResultIndex', () => {
	it('should move to the following result', () => {
		expect(nextResultIndex(0, 3)).toBe(1);
	});

	it('should stay on the last result when already at the end', () => {
		expect(nextResultIndex(2, 3)).toBe(2);
	});

	it('should return the first index when there is no result', () => {
		expect(nextResultIndex(0, 0)).toBe(FIRST_RESULT_INDEX);
	});
});

describe('previousResultIndex', () => {
	it('should move to the preceding result', () => {
		expect(previousResultIndex(2)).toBe(1);
	});

	it('should stay on the first result when already at the start', () => {
		expect(previousResultIndex(FIRST_RESULT_INDEX)).toBe(FIRST_RESULT_INDEX);
	});
});
