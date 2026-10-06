import { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import type { FuzzyMatch } from '~/lib/fuzzy_links';
import { SearchLinkResults } from '~/components/dashboard/search/search_link_results';

type SearchResultsContentProps = {
	isLoading: boolean;
	searchTerm: string;
	results: FuzzyMatch<Data.Link>[];
	selectedIndex: number;
	onResultClick: (link: Data.Link) => void;
	onClose: () => void;
};

export function SearchResultsContent({
	isLoading,
	searchTerm,
	results,
	selectedIndex,
	onResultClick,
	onClose,
}: Readonly<SearchResultsContentProps>) {
	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="i-svg-spinners-3-dots-fade w-6 h-6 text-gray-400" />
			</div>
		);
	}

	if (results.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500 dark:text-gray-400">
				{searchTerm.trim().length === 0 ? (
					<Trans>No links yet</Trans>
				) : (
					<Trans>No results found</Trans>
				)}
			</div>
		);
	}

	return (
		<SearchLinkResults
			results={results}
			selectedIndex={selectedIndex}
			handleResultClick={onResultClick}
			onCloseModal={onClose}
		/>
	);
}
