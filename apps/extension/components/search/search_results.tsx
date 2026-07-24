import { useSearch } from '@/hooks/use_search';
import { SearchLinkResult } from './search_link_result';
import { SearchCollectionResult } from './search_collection_result';

interface SearchResultsProps {
	term: string;
}

export function SearchResults({ term }: Readonly<SearchResultsProps>) {
	const { results, isLoading, error } = useSearch(term);

	if (isLoading) {
		return <p className="p-4 text-sm text-gray-500">Searching…</p>;
	}

	if (error) {
		return (
			<p className="p-4 text-sm text-red-500">Search failed. Try again.</p>
		);
	}

	if (results.length === 0) {
		return (
			<p className="p-4 text-sm text-gray-500">No results for "{term}".</p>
		);
	}

	const linkResults = results.filter((result) => result.type === 'link');
	const collectionResults = results.filter(
		(result) => result.type === 'collection'
	);

	return (
		<div className="flex-1 space-y-1 overflow-y-auto px-2 py-1">
			{linkResults.map((result) => (
				<SearchLinkResult key={`link-${result.id}`} result={result} />
			))}
			{collectionResults.map((result) => (
				<SearchCollectionResult
					key={`collection-${result.id}`}
					result={result}
				/>
			))}
		</div>
	);
}
