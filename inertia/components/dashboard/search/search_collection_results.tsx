import { Trans } from '@lingui/react/macro';
import { SearchResult } from '~/components/dashboard/modals/search_modal';
import { SearchCollectionResult } from '~/components/dashboard/search/search_collection_result';

interface SearchCollectionResultsProps {
	collectionResults: SearchResult[];
	linkResultsLength: number;
	selectedIndex: number;
	handleResultClick: (result: SearchResult) => void;
	searchTerm: string;
}

export const SearchCollectionResults = ({
	collectionResults,
	linkResultsLength,
	selectedIndex,
	handleResultClick,
	searchTerm,
}: SearchCollectionResultsProps) =>
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
