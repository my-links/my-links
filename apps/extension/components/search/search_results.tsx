import { useSearch } from '@/hooks/use_search';
import { SearchLinkResult } from './search_link_result';
import { useResultNavigation } from '@/hooks/use_result_navigation';

interface SearchResultsProps {
	term: string;
	onResultActivate: () => void;
}

export function SearchResults({
	term,
	onResultActivate,
}: Readonly<SearchResultsProps>) {
	const { results, isLoading } = useSearch(term);
	const { selectedIndex, resultsRef } = useResultNavigation(results);

	if (isLoading) {
		return <p className="p-4 text-sm text-gray-500">Searching…</p>;
	}

	if (results.length === 0) {
		return (
			<p className="p-4 text-sm text-gray-500">No results for "{term}".</p>
		);
	}

	return (
		<div
			ref={resultsRef}
			className="flex-1 space-y-1 overflow-y-auto px-2 py-1"
		>
			{results.map((match, index) => (
				<SearchLinkResult
					key={match.link.id}
					match={match}
					resultIndex={index}
					isSelected={index === selectedIndex}
					onActivate={onResultActivate}
				/>
			))}
		</div>
	);
}
