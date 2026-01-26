import clsx from 'clsx';
import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'danger'
	| 'danger-ghost'
	| 'ghost'
	| 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	children: ReactNode;
	fullWidth?: boolean;
	ref?: React.Ref<HTMLButtonElement>;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
	primary:
		'text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600',
	secondary:
		'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
	danger:
		'text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 dark:disabled:bg-gray-600',
	'danger-ghost':
		'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
	outline:
		'text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-white/50 dark:hover:bg-gray-800/50',
	ghost:
		'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
	sm: 'px-3 py-1.5 text-sm',
	md: 'px-4 py-2 text-sm',
	lg: 'px-4 py-3 text-base',
};

export const Button = ({
	variant = 'primary',
	size = 'md',
	loading = false,
	disabled,
	fullWidth = false,
	className,
	children,
	ref,
	...props
}: ButtonProps) => (
	<button
		ref={ref}
		disabled={disabled ?? loading}
		className={clsx(
			'cursor-pointer inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors',
			'disabled:opacity-50 disabled:cursor-not-allowed',
			'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
			VARIANT_CLASSES[variant],
			SIZE_CLASSES[size],
			fullWidth ? 'w-full' : 'w-fit',
			className
		)}
		{...props}
	>
		{loading && (
			<span className="i-svg-spinners-3-dots-fade w-4 h-4" aria-hidden="true" />
		)}
		{children}
	</button>
);
