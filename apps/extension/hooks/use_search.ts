import { useQuery } from '@tanstack/react-query';

import type { SearchResult } from '@/lib/api/types';
import { searchLinksAndCollections } from '@/lib/api/search';

const MIN_SEARCH_TERM_LENGTH = 2;

interface UseSearchReturn {
	results: SearchResult[];
	isLoading: boolean;
	error: Error | null;
}

export function useSearch(term: string): UseSearchReturn {
	const trimmedTerm = term.trim();
	const isSearchEnabled = trimmedTerm.length >= MIN_SEARCH_TERM_LENGTH;

	const query = useQuery({
		queryKey: ['search', trimmedTerm],
		queryFn: () => searchLinksAndCollections(trimmedTerm),
		enabled: isSearchEnabled,
	});

	return {
		results: isSearchEnabled ? (query.data ?? []) : [],
		isLoading: isSearchEnabled && query.isPending,
		error: query.error,
	};
}
