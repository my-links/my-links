import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	error?: string | string[];
	disabled?: boolean;
	ref?: React.Ref<HTMLInputElement>;
}

export const Input = ({
	error,
	disabled,
	className,
	ref,
	...props
}: InputProps) => (
	<input
		ref={ref}
		disabled={disabled}
		className={clsx(
			'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800',
			'text-gray-900 dark:text-gray-100',
			'placeholder-gray-500 dark:placeholder-gray-400',
			'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
			'transition-colors',
			!!error
				? 'border-red-500 dark:border-red-500'
				: 'border-gray-300 dark:border-gray-600',
			disabled && 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed',
			className
		)}
		{...props}
	/>
);
