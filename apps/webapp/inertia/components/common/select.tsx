import clsx from 'clsx';
import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	error?: string | string[];
	disabled?: boolean;
	ref?: React.Ref<HTMLSelectElement>;
}

export const Select = ({
	error,
	disabled,
	className,
	ref,
	...props
}: Readonly<SelectProps>) => (
	<select
		ref={ref}
		disabled={disabled}
		className={clsx(
			'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800',
			'text-gray-900 dark:text-gray-100',
			'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
			'transition-colors',
			error
				? 'border-red-500 dark:border-red-500'
				: 'border-gray-300 dark:border-gray-600',
			disabled && 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed',
			className
		)}
		{...props}
	/>
);
