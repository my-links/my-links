import { describe, expect, it } from 'vitest';

import {
	FIRST_RESULT_INDEX,
	nextResultIndex,
	previousResultIndex,
} from '@/lib/search/result_list';

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
