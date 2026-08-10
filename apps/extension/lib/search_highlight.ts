export interface HighlightSegment {
	text: string;
	isMatch: boolean;
}

/**
 * Splits `text` into consecutive segments, flagging the ones covered by
 * `ranges` (flat `[start0, end0, start1, end1, ...]` pairs, ascending and
 * non-overlapping — the shape uFuzzy's match info returns). Returns a
 * single unmatched segment when there are no ranges, so callers never
 * special-case an unmatched row.
 */
export function splitIntoHighlightSegments(
	text: string,
	ranges: readonly number[]
): HighlightSegment[] {
	if (ranges.length === 0) {
		return [{ text, isMatch: false }];
	}

	const segments: HighlightSegment[] = [];
	let cursor = 0;

	for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex += 2) {
		const start = ranges[rangeIndex];
		const end = ranges[rangeIndex + 1];
		if (start === undefined || end === undefined) {
			continue;
		}

		if (start > cursor) {
			segments.push({ text: text.slice(cursor, start), isMatch: false });
		}

		segments.push({ text: text.slice(start, end), isMatch: true });
		cursor = end;
	}

	if (cursor < text.length) {
		segments.push({ text: text.slice(cursor), isMatch: false });
	}

	return segments;
}
