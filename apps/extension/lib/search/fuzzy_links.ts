import uFuzzy from '@leeoniya/ufuzzy';

export interface FuzzyLink {
	id: number;
	name: string;
	description: string | null;
	url: string;
}

export interface FuzzyMatch<TLink extends FuzzyLink> {
	link: TLink;
	nameRanges: readonly number[];
}

const STRICT_INTRA_INSERTIONS = 1;
const LOOSE_INTRA_INSERTIONS = 3;

/** uFuzzy caps out-of-order permutations at 5 terms (120 max searches) internally. */
const MAX_OUT_OF_ORDER_TERMS = 5;

const strictMatcher = new uFuzzy({ intraIns: STRICT_INTRA_INSERTIONS });
const looseMatcher = new uFuzzy({ intraIns: LOOSE_INTRA_INSERTIONS });

function foldAccents(text: string): string {
	return text.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function buildHaystackEntry(link: FuzzyLink): string {
	return foldAccents(`${link.name} ${link.description ?? ''} ${link.url}`);
}

/**
 * Keeps only the ranges that fall inside the name — the haystack also
 * contains the description and url, but only the name is highlighted.
 */
function extractNameRanges(
	matchRanges: readonly number[],
	nameLength: number
): readonly number[] {
	const nameRanges: number[] = [];

	for (
		let rangeStartIndex = 0;
		rangeStartIndex < matchRanges.length;
		rangeStartIndex += 2
	) {
		const start = matchRanges[rangeStartIndex];
		const end = matchRanges[rangeStartIndex + 1];

		if (start === undefined || end === undefined || start >= nameLength) {
			continue;
		}

		nameRanges.push(start, Math.min(end, nameLength));
	}

	return nameRanges;
}

function runSearch(
	matcher: uFuzzy,
	haystack: readonly string[],
	needle: string
): uFuzzy.RankedResult | null {
	const [, info, order] = matcher.search(
		haystack as string[],
		needle,
		MAX_OUT_OF_ORDER_TERMS
	);

	if (!info || !order || order.length === 0) {
		return null;
	}

	return [info.idx, info, order];
}

/**
 * Matches `links` against `query` with a strict pass first (typo-tolerant
 * but requires terms in order and mostly contiguous), falling back to a
 * loose pass only when the strict one finds nothing — this is what lets
 * `ytb` match `youtube` without ranking sloppy matches above precise ones.
 */
export function matchLinks<TLink extends FuzzyLink>(
	links: readonly TLink[],
	query: string
): FuzzyMatch<TLink>[] {
	const trimmedQuery = query.trim();

	if (trimmedQuery.length === 0) {
		return [];
	}

	const needle = foldAccents(trimmedQuery);
	const haystack = links.map(buildHaystackEntry);

	const result =
		runSearch(strictMatcher, haystack, needle) ??
		runSearch(looseMatcher, haystack, needle);

	if (!result) {
		return [];
	}

	const [, info, order] = result;

	return order.flatMap((orderIndex) => {
		const linkIndex = info.idx[orderIndex];
		const matchRanges = info.ranges[orderIndex];
		const link = linkIndex === undefined ? undefined : links[linkIndex];

		if (!link || matchRanges === undefined) {
			return [];
		}

		const foldedNameLength = foldAccents(link.name).length;
		const isFoldLengthPreserving = foldedNameLength === link.name.length;

		return [
			{
				link,
				nameRanges: isFoldLengthPreserving
					? extractNameRanges(matchRanges, foldedNameLength)
					: [],
			},
		];
	});
}
