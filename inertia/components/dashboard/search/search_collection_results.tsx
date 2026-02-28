import { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { SearchCollectionResult } from '~/components/dashboard/search/search_collection_result';

interface SearchCollectionResultsProps {
	collectionResults: Data.SearchResult[];
	linkResultsLength: number;
	selectedIndex: number;
	handleResultClick: (result: Data.SearchResult) => void;
	searchTerm: string;
}

export const SearchCollectionResults = ({
	collectionResults,
	linkResultsLength,
	selectedIndex,
	handleResultClick,
	searchTerm,
}: Readonly<SearchCollectionResultsProps>) =>
	collectionResults.length > 0 && (
		<div>
			<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
				<div className="i-ant-design-folder-open-filled w-4 h-4" />
				<Trans>Collections</Trans> ({collectionResults.length})
			</h3>
			<div className="space-y-2">
				{collectionResults.map((result, index) => {
					const resultIndex = linkResultsLength + index;
					const isSelected = selectedIndex === resultIndex;
					return (
						<SearchCollectionResult
							key={`collection-${result.id}`}
							result={result}
							resultIndex={resultIndex}
							isSelected={isSelected}
							handleResultClick={handleResultClick}
							searchTerm={searchTerm}
						/>
					);
				})}
			</div>
		</div>
	);
