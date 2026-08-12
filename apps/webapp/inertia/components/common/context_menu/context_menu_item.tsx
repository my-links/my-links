import { MouseEvent, ReactNode } from 'react';

import { cn } from '~/lib/cn';

interface ContextMenuItemProps {
	icon: string;
	onClick: (e: MouseEvent<HTMLButtonElement>) => void;
	children: ReactNode;
	variant?: 'default' | 'danger';
	disabled?: boolean;
}

const ITEM_BASE_CLASSES =
	'w-full flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent';

export const ContextMenuItem = ({
	icon,
	onClick,
	children,
	variant = 'default',
	disabled = false,
}: Readonly<ContextMenuItemProps>) => (
	<button
		onClick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			onClick(e);
		}}
		disabled={disabled}
		className={cn(
			ITEM_BASE_CLASSES,
			variant === 'danger'
				? 'text-red-600 dark:text-red-400'
				: 'text-gray-700 dark:text-gray-300'
		)}
	>
		<div className={cn('w-4 h-4', icon)} />
		{children}
	</button>
);
