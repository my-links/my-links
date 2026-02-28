import clsx from 'clsx';
import { Layout, useLayoutStore } from '~/stores/layout_store';

const layoutOptions: Array<{
	value: Layout;
	icon: string;
	label: string;
}> = [
	{
		value: 'list',
		icon: 'i-ant-design-unordered-list-outlined',
		label: 'List',
	},
	{ value: 'grid', icon: 'i-ant-design-appstore-outlined', label: 'Grid' },
	{
		value: 'masonry',
		icon: 'i-ant-design-pic-center-outlined',
		label: 'Masonry',
	},
	{
		value: 'compact',
		icon: 'i-ant-design-compress-outlined',
		label: 'Compact',
	},
] as const;

interface FilterListProps {
	layoutStoreKey: string;
}

export function FilterList({ layoutStoreKey }: Readonly<FilterListProps>) {
	const { layout, setLayout } = useLayoutStore(layoutStoreKey);
	return (
		<div className="flex items-center gap-1 p-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50">
			{layoutOptions.map((option) => (
				<button
					key={option.value}
					onClick={() => setLayout(option.value)}
					className={clsx(
						'cursor-pointer p-2 rounded transition-colors',
						layout === option.value
							? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
							: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
					)}
					title={option.label}
					aria-label={option.label}
				>
					<div className={clsx(option.icon, 'w-5 h-5')} />
				</button>
			))}
		</div>
	);
}
