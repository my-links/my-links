import { t } from '@lingui/core/macro';
import { Tooltip } from '@minimalstuff/ui';

import { cn } from '~/lib/cn';
import { Layout, useLayoutStore } from '~/stores/layout_store';

function getLayoutOptions(): Array<{
	value: Layout;
	icon: string;
	label: string;
}> {
	return [
		{
			value: 'list',
			icon: 'i-ant-design-unordered-list-outlined',
			label: t`List`,
		},
		{ value: 'grid', icon: 'i-ant-design-appstore-outlined', label: t`Grid` },
		{
			value: 'masonry',
			icon: 'i-ant-design-pic-center-outlined',
			label: t`Masonry`,
		},
		{
			value: 'compact',
			icon: 'i-ant-design-compress-outlined',
			label: t`Compact`,
		},
	];
}

interface FilterListProps {
	layoutStoreKey: string;
}

export function FilterList({ layoutStoreKey }: Readonly<FilterListProps>) {
	const { layout, setLayout } = useLayoutStore(layoutStoreKey);
	const layoutOptions = getLayoutOptions();

	return (
		<div
			data-tour="link-layout"
			className="flex items-center gap-1 p-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50"
		>
			{layoutOptions.map((option) => (
				<Tooltip key={option.value} content={option.label} position="bottom">
					<button
						onClick={() => setLayout(option.value)}
						className={cn(
							'cursor-pointer p-2 rounded transition-colors',
							layout === option.value
								? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
								: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
						)}
						aria-label={option.label}
					>
						<div className={cn(option.icon, 'w-5 h-5')} />
					</button>
				</Tooltip>
			))}
		</div>
	);
}
