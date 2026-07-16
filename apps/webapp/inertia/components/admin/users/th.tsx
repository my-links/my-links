import { PropsWithChildren } from 'react';

interface ThProps extends PropsWithChildren {
	reversed: boolean;
	sorted: boolean;
	onSort(): void;
}

export function Th({ children, reversed, sorted, onSort }: Readonly<ThProps>) {
	const iconClass = sorted
		? reversed
			? 'i-tabler-chevron-up'
			: 'i-tabler-chevron-down'
		: 'i-tabler-selector';
	return (
		<th className="p-0">
			<button
				onClick={onSort}
				className="w-full flex items-center justify-between gap-2 px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-left group"
			>
				<span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
					{children}
				</span>
				<div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
					<i
						className={`${iconClass} w-4 h-4 block text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors ${sorted ? 'text-blue-600 dark:text-blue-400' : ''}`}
					/>
				</div>
			</button>
		</th>
	);
}
