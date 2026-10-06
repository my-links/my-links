import { Data } from '@generated/data';
import { useEffect, useMemo, useState } from 'react';

import { tuyauClient } from '~/lib/tuyau';
import { matchLinks, type FuzzyMatch } from '~/lib/fuzzy_links';

type UseSearchResultsReturn = {
	results: FuzzyMatch<Data.Link>[];
	isLoading: boolean;
};

/**
 * The generated tuyau types claim `GET /links` resolves to a bare
 * `Data.Link[]`, but the shared `ApiSerializer` always wraps collections
 * under a `data` key at runtime — this narrows the actual response shape
 * without trusting either side blindly.
 */
function extractLinks(payload: unknown): Data.Link[] {
	if (Array.isArray(payload)) {
		return payload;
	}

	if (
		typeof payload === 'object' &&
		payload !== null &&
		'data' in payload &&
		Array.isArray(payload.data)
	) {
		return payload.data;
	}

	return [];
}

/**
 * When there's no search term yet, show every link sorted by most recent
 * first, rather than an empty "start typing" placeholder.
 */
function toRecentMatches(links: readonly Data.Link[]): FuzzyMatch<Data.Link>[] {
	return [...links]
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)
		.map((link) => ({ link, nameRanges: [] }));
}

export function useSearchResults(searchTerm: string): UseSearchResultsReturn {
	const [links, setLinks] = useState<Data.Link[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		tuyauClient
			.get('/links', {})
			.then(({ data }) => {
				if (isMounted) {
					setLinks(extractLinks(data));
				}
			})
			.catch(() => {
				if (isMounted) {
					setLinks([]);
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const results = useMemo(
		() =>
			searchTerm.trim().length === 0
				? toRecentMatches(links)
				: matchLinks(links, searchTerm),
		[links, searchTerm]
	);

	return { results, isLoading };
}
