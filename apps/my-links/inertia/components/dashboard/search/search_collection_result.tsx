import clsx from 'clsx';
import { Highlight } from '~/components/common/hightlight';
import { SearchResult } from '~/components/dashboard/modals/search_modal';

interface SearchCollectionResultProps {
	result: SearchResult;
	resultIndex: number;
	isSelected: boolean;
	handleResultClick: (result: SearchResult) => void;
	searchTerm: string;
}

export const SearchCollectionResult = ({
	result,
	resultIndex,
	isSelected,
	handleResultClick,
	searchTerm,
}: SearchCollectionResultProps) => (
	<button
		key={`collection-${result.id}`}
		type="button"
		data-result-index={resultIndex}
		onClick={() => handleResultClick(result)}
		className={clsx(
			'w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3',
			isSelected
				? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
				: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm'
		)}
	>
		{result.icon ? (
			<span className="text-lg flex-shrink-0 w-6 h-6 flex items-center justify-center">
				{result.icon}
			</span>
		) : (
			<div className="i-ant-design-folder-open-filled w-6 h-6 flex-shrink-0" />
		)}
		<div className="flex-1 min-w-0">
			<div className="font-medium text-blue-600 dark:text-blue-400 mb-1">
				<Highlight text={result.name} searchTerm={searchTerm} />
			</div>
		</div>
	</button>
);
