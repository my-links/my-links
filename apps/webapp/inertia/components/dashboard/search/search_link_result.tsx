import clsx from 'clsx';
import { Data } from '@generated/data';

import type { FuzzyMatch } from '~/lib/fuzzy_links';
import { Highlight } from '~/components/common/highlight';
import { LinkFavicon } from '~/components/dashboard/links/link_favicon';

interface SearchLinkResultProps {
	match: FuzzyMatch<Data.Link>;
	resultIndex: number;
	isSelected: boolean;
	handleResultClick: (link: Data.Link) => void;
}

export const SearchLinkResult = ({
	match,
	resultIndex,
	isSelected,
	handleResultClick,
}: Readonly<SearchLinkResultProps>) => {
	const { link, nameRanges } = match;

	return (
		<button
			key={`link-${link.id}`}
			type="button"
			data-result-index={resultIndex}
			onClick={() => handleResultClick(link)}
			className={clsx(
				'w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3',
				isSelected
					? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
					: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm'
			)}
		>
			<LinkFavicon url={link.url} size={24} />
			<div className="flex-1 min-w-0">
				<div className="font-medium text-blue-600 dark:text-blue-400 mb-1">
					<Highlight text={link.name} ranges={nameRanges} />
				</div>
				<div className="text-xs text-gray-500 dark:text-gray-400 truncate">
					{link.url}
				</div>
			</div>
		</button>
	);
};
