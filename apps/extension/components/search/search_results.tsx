import { useMemo } from 'react';

import { useSearch } from '@/hooks/use_search';
import { SearchLinkResult } from './search_link_result';
import { buildDisplayedResults } from '@/lib/search/result_list';
import { useResultNavigation } from '@/hooks/use_result_navigation';

interface SearchResultsProps {
	term: string;
	onResultActivate: () => void;
}

export function SearchResults({
	term,
	onResultActivate,
}: Readonly<SearchResultsProps>) {
	const { results, isLoading, error } = useSearch(term);
	const displayedResults = useMemo(
		() => buildDisplayedResults(results),
		[results]
	);
	const { selectedIndex, resultsRef } = useResultNavigation(displayedResults);

	if (isLoading) {
		return <p className="p-4 text-sm text-gray-500">Searching…</p>;
	}

	if (error) {
		return (
			<p className="p-4 text-sm text-red-500">Search failed. Try again.</p>
		);
	}

	if (displayedResults.length === 0) {
		return (
			<p className="p-4 text-sm text-gray-500">No results for "{term}".</p>
		);
	}

	return (
		<div
			ref={resultsRef}
			className="flex-1 space-y-1 overflow-y-auto px-2 py-1"
		>
			{displayedResults.map((result, index) => (
				<SearchLinkResult
					key={result.id}
					result={result}
					searchTerm={term}
					resultIndex={index}
					isSelected={index === selectedIndex}
					onActivate={onResultActivate}
				/>
			))}
		</div>
	);
}
