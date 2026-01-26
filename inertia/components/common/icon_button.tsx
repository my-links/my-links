import clsx from 'clsx';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon: string;
	'aria-label': string;
	variant?: 'default' | 'ghost' | 'danger' | 'outline';
	size?: 'sm' | 'md' | 'lg';
	children?: ReactNode;
	ref?: React.Ref<HTMLButtonElement>;
}

const VARIANT_CLASSES = {
	default:
		'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
	ghost:
		'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50',
	danger:
		'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
	outline:
		'text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-white/50 dark:hover:bg-gray-800/50',
};

const SIZE_CLASSES = {
	sm: 'p-1',
	md: 'p-2',
	lg: 'p-3',
};

const ICON_SIZE_CLASSES = {
	sm: 'w-4 h-4',
	md: 'w-5 h-5',
	lg: 'w-6 h-6',
};

export const IconButton = ({
	icon,
	'aria-label': ariaLabel,
	variant = 'default',
	size = 'md',
	className,
	children,
	ref,
	...props
}: IconButtonProps) => (
	<button
		ref={ref}
		type="button"
		aria-label={ariaLabel}
		className={clsx(
			'cursor-pointer inline-flex items-center justify-center rounded transition-colors',
			'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
			VARIANT_CLASSES[variant],
			SIZE_CLASSES[size],
			className
		)}
		{...props}
	>
		<div className={clsx(icon, ICON_SIZE_CLASSES[size])} />
		{children}
	</button>
);
