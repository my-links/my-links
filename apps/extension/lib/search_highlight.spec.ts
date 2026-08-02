import { describe, expect, it } from 'vitest';

import { splitIntoHighlightSegments } from '@/lib/search_highlight';

describe('splitIntoHighlightSegments', () => {
	it('should return the whole text as a single unmatched segment when there are no ranges', () => {
		expect(splitIntoHighlightSegments('Documentation', [])).toEqual([
			{ text: 'Documentation', isMatch: false },
		]);
	});

	it('should flag the range in the middle of the text', () => {
		expect(splitIntoHighlightSegments('Documentation', [4, 8])).toEqual([
			{ text: 'Docu', isMatch: false },
			{ text: 'ment', isMatch: true },
			{ text: 'ation', isMatch: false },
		]);
	});

	it('should flag a range starting at the beginning of the text', () => {
		expect(splitIntoHighlightSegments('AdonisJS', [0, 6])).toEqual([
			{ text: 'Adonis', isMatch: true },
			{ text: 'JS', isMatch: false },
		]);
	});

	it('should flag a range ending at the end of the text', () => {
		expect(splitIntoHighlightSegments('blog blog', [5, 9])).toEqual([
			{ text: 'blog ', isMatch: false },
			{ text: 'blog', isMatch: true },
		]);
	});

	it('should flag every disjoint range', () => {
		expect(splitIntoHighlightSegments('blog blog', [0, 4, 5, 9])).toEqual([
			{ text: 'blog', isMatch: true },
			{ text: ' ', isMatch: false },
			{ text: 'blog', isMatch: true },
		]);
	});

	it('should flag the whole text when the range spans it entirely', () => {
		expect(splitIntoHighlightSegments('doc', [0, 3])).toEqual([
			{ text: 'doc', isMatch: true },
		]);
	});
});
