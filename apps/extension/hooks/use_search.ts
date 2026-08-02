import { useQuery } from '@tanstack/react-query';

import { searchLinks } from '@/lib/api/search';
import type { SearchResult } from '@/lib/api/types';

const NO_RESULTS: SearchResult[] = [];

interface UseSearchReturn {
	results: SearchResult[];
	isLoading: boolean;
	error: Error | null;
}

export function useSearch(term: string): UseSearchReturn {
	const trimmedTerm = term.trim();
	const isSearchEnabled = trimmedTerm.length > 0;

	const query = useQuery({
		queryKey: ['search', trimmedTerm],
		queryFn: () => searchLinks(trimmedTerm),
		enabled: isSearchEnabled,
	});

	return {
		results: isSearchEnabled ? (query.data ?? NO_RESULTS) : NO_RESULTS,
		isLoading: isSearchEnabled && query.isPending,
		error: query.error,
	};
}
