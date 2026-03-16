import { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { SearchLinkResult } from '~/components/dashboard/search/search_link_result';

interface SearchLinkResultsProps {
	linkResults: Data.SearchResult[];
	selectedIndex: number;
	handleResultClick: (result: Data.SearchResult) => void;
	searchTerm: string;
}

export const SearchLinkResults = ({
	linkResults,
	selectedIndex,
	handleResultClick,
	searchTerm,
}: Readonly<SearchLinkResultsProps>) =>
	linkResults.length > 0 && (
		<div>
			<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
				<div className="i-ion-link w-4 h-4" />
				<Trans>Links</Trans> ({linkResults.length})
			</h3>
			<div className="space-y-2">
				{linkResults.map((result, resultIndex) => (
					<SearchLinkResult
						key={`link-${result.id}`}
						result={result}
						resultIndex={resultIndex}
						isSelected={selectedIndex === resultIndex}
						handleResultClick={handleResultClick}
						searchTerm={searchTerm}
					/>
				))}
			</div>
		</div>
	);
