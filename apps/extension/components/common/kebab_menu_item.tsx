import clsx from 'clsx';
import type { ReactNode } from 'react';

interface KebabMenuItemProps {
	icon: string;
	onClick: () => void;
	isDanger?: boolean;
	disabled?: boolean;
	children: ReactNode;
}

export function KebabMenuItem({
	icon,
	onClick,
	isDanger = false,
	disabled = false,
	children,
}: Readonly<KebabMenuItemProps>) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={clsx(
				'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:enabled:bg-gray-100 dark:hover:enabled:bg-gray-700',
				disabled
					? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
					: isDanger
						? 'text-red-600 dark:text-red-400'
						: 'text-gray-700 dark:text-gray-300'
			)}
		>
			<div className={clsx(icon, 'h-4 w-4 flex-shrink-0')} />
			{children}
		</button>
	);
}
