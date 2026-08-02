import { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import type { FuzzyMatch } from '~/lib/fuzzy_links';
import { SearchLinkResult } from '~/components/dashboard/search/search_link_result';

interface SearchLinkResultsProps {
	results: FuzzyMatch<Data.Link>[];
	selectedIndex: number;
	handleResultClick: (link: Data.Link) => void;
}

export const SearchLinkResults = ({
	results,
	selectedIndex,
	handleResultClick,
}: Readonly<SearchLinkResultsProps>) => (
	<div>
		<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
			<div className="i-ion-link w-4 h-4" />
			<Trans>Links</Trans> ({results.length})
		</h3>
		<div className="space-y-2">
			{results.map((match, resultIndex) => (
				<SearchLinkResult
					key={`link-${match.link.id}`}
					match={match}
					resultIndex={resultIndex}
					isSelected={selectedIndex === resultIndex}
					handleResultClick={handleResultClick}
				/>
			))}
		</div>
	</div>
);
