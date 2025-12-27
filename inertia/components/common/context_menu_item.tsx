import clsx from 'clsx';
import { MouseEvent, ReactNode } from 'react';

interface ContextMenuItemProps {
	icon: string;
	onClick: (e: MouseEvent<HTMLButtonElement>) => void;
	children: ReactNode;
	variant?: 'default' | 'danger';
}

const ITEM_BASE_CLASSES =
	'w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700';

export const ContextMenuItem = ({
	icon,
	onClick,
	children,
	variant = 'default',
}: ContextMenuItemProps) => (
	<button
		onClick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			onClick(e);
		}}
		className={clsx(
			ITEM_BASE_CLASSES,
			variant === 'danger'
				? 'text-red-600 dark:text-red-400'
				: 'text-gray-700 dark:text-gray-300'
		)}
	>
		<div className={clsx('w-4 h-4', icon)} />
		{children}
	</button>
);
