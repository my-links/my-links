import { describe, expect, it } from 'vitest';

import { matchLinks, type FuzzyLink } from './fuzzy_links';

function buildLink(overrides: Partial<FuzzyLink> = {}): FuzzyLink {
	return {
		id: 1,
		name: 'Example',
		description: null,
		url: 'https://example.com',
		...overrides,
	};
}

describe('matchLinks', () => {
	it('should match an abbreviation against a name missing letters', () => {
		const link = buildLink({ name: 'youtube', url: 'https://youtube.com' });

		const matches = matchLinks([link], 'ytb');

		expect(matches.map((match) => match.link.id)).toEqual([link.id]);
	});

	it('should match multi-word queries with terms out of order', () => {
		const link = buildLink({
			name: 'YouTube Tutorial',
			url: 'https://youtube.com/tuto',
		});

		const matches = matchLinks([link], 'tutorial youtube');

		expect(matches.map((match) => match.link.id)).toEqual([link.id]);
	});

	it('should ignore accents', () => {
		const link = buildLink({
			name: 'Réunion',
			url: 'https://example.com/reunion',
		});

		const matches = matchLinks([link], 'reunion');

		expect(matches.map((match) => match.link.id)).toEqual([link.id]);
	});

	it('should match on the description when the name does not contain the query', () => {
		const link = buildLink({
			name: 'Foo',
			description: 'A bar baz page',
		});

		const matches = matchLinks([link], 'baz');

		expect(matches.map((match) => match.link.id)).toEqual([link.id]);
	});

	it('should match on the url when neither the name nor the description contain the query', () => {
		const link = buildLink({
			name: 'Foo',
			description: null,
			url: 'https://example.com/special-page',
		});

		const matches = matchLinks([link], 'special');

		expect(matches.map((match) => match.link.id)).toEqual([link.id]);
	});

	it('should return no matches when the query matches nothing', () => {
		const link = buildLink();

		expect(matchLinks([link], 'zzzzzzzz')).toEqual([]);
	});

	it('should return no matches for a blank query', () => {
		const link = buildLink();

		expect(matchLinks([link], '   ')).toEqual([]);
	});

	it('should keep name ranges within the bounds of the name', () => {
		const link = buildLink({ name: 'youtube', url: 'https://youtube.com' });

		const [match] = matchLinks([link], 'ytb');

		expect(match?.nameRanges.length).toBeGreaterThan(0);
		expect(match?.nameRanges.every((index) => index <= link.name.length)).toBe(
			true
		);
	});

	it('should return no name ranges when the match is outside the name', () => {
		const link = buildLink({ name: 'Foo', description: 'A bar baz page' });

		const [match] = matchLinks([link], 'baz');

		expect(match?.nameRanges).toEqual([]);
	});
});
