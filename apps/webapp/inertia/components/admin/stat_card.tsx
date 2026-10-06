import type { ReactNode } from 'react';

import { cn } from '~/lib/cn';

type StatCardProps = {
	label: ReactNode;
	value: ReactNode;
	icon: string;
	tint: string;
};

export const StatCard = ({
	label,
	value,
	icon,
	tint,
}: Readonly<StatCardProps>) => (
	<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
		<div className="flex items-center justify-between">
			<div>
				<p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
					{label}
				</p>
				<p className="text-3xl font-bold text-gray-900 dark:text-white">
					{value}
				</p>
			</div>
			<div className={cn('p-3 rounded-lg', tint)}>
				<i className={cn(icon, 'w-8 h-8')} />
			</div>
		</div>
	</div>
);
