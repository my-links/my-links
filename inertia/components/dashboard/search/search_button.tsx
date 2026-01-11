import { Trans } from '@lingui/react/macro';

interface SearchButtonProps {
	onClick: () => void;
}

export const SearchButton = ({ onClick }: SearchButtonProps) => (
	<button
		type="button"
		onClick={onClick}
		className="flex-1 max-w-md flex items-center gap-2 px-4 py-2 border border-gray-300/50 dark:border-gray-600/50 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-left"
	>
		<div className="i-ion-search w-5 h-5 flex-shrink-0" />
		<span className="flex-1 truncate">
			<Trans>Search...</Trans>
		</span>
		<kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
			Ctrl+K
		</kbd>
	</button>
);
