const REGEX_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

export interface HighlightSegment {
	text: string;
	isMatch: boolean;
}

function escapeForRegex(term: string): string {
	return term.replace(REGEX_SPECIAL_CHARACTERS, '\\$&');
}

/**
 * Splits `text` into consecutive segments, flagging the ones that
 * case-insensitively equal `searchTerm`. Returns a single unmatched segment
 * when the term is blank, so callers never special-case an empty search.
 */
export function splitIntoHighlightSegments(
	text: string,
	searchTerm: string
): HighlightSegment[] {
	const trimmedSearchTerm = searchTerm.trim();

	if (trimmedSearchTerm.length === 0) {
		return [{ text, isMatch: false }];
	}

	const escapedSearchTerm = escapeForRegex(trimmedSearchTerm);
	const splitPattern = new RegExp(`(${escapedSearchTerm})`, 'gi');
	const matchPattern = new RegExp(`^${escapedSearchTerm}$`, 'i');

	return text
		.split(splitPattern)
		.filter((part) => part.length > 0)
		.map((part) => ({ text: part, isMatch: matchPattern.test(part) }));
}
