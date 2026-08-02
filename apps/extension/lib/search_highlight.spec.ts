import { describe, expect, it } from 'vitest';

import { splitIntoHighlightSegments } from '@/lib/search_highlight';

describe('splitIntoHighlightSegments', () => {
	it('should return the whole text as a single unmatched segment when the term is empty', () => {
		expect(splitIntoHighlightSegments('Documentation', '')).toEqual([
			{ text: 'Documentation', isMatch: false },
		]);
	});

	it('should return the whole text as a single unmatched segment when the term is only whitespace', () => {
		expect(splitIntoHighlightSegments('Documentation', '   ')).toEqual([
			{ text: 'Documentation', isMatch: false },
		]);
	});

	it('should flag the matching segment when the term appears inside the text', () => {
		expect(splitIntoHighlightSegments('Documentation', 'ment')).toEqual([
			{ text: 'Docu', isMatch: false },
			{ text: 'ment', isMatch: true },
			{ text: 'ation', isMatch: false },
		]);
	});

	it('should match regardless of case while preserving the original casing', () => {
		expect(splitIntoHighlightSegments('AdonisJS', 'adonis')).toEqual([
			{ text: 'Adonis', isMatch: true },
			{ text: 'JS', isMatch: false },
		]);
	});

	it('should flag every occurrence of the term', () => {
		expect(splitIntoHighlightSegments('blog blog', 'blog')).toEqual([
			{ text: 'blog', isMatch: true },
			{ text: ' ', isMatch: false },
			{ text: 'blog', isMatch: true },
		]);
	});

	it('should treat regex metacharacters as literals', () => {
		expect(splitIntoHighlightSegments('a.b acb', '.')).toEqual([
			{ text: 'a', isMatch: false },
			{ text: '.', isMatch: true },
			{ text: 'b acb', isMatch: false },
		]);
	});

	it('should return a single unmatched segment when the term is absent', () => {
		expect(splitIntoHighlightSegments('Documentation', 'zzz')).toEqual([
			{ text: 'Documentation', isMatch: false },
		]);
	});

	it('should ignore surrounding whitespace in the term', () => {
		expect(splitIntoHighlightSegments('Documentation', '  doc  ')).toEqual([
			{ text: 'Doc', isMatch: true },
			{ text: 'umentation', isMatch: false },
		]);
	});
});
