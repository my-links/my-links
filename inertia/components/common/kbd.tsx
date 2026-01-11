import clsx from 'clsx';

interface KbdProps {
	children: React.ReactNode;
	className?: string;
}

export const Kbd = ({ children, className }: KbdProps) => (
	<kbd
		className={clsx(
			'inline-flex items-center px-2 py-0.5 text-xs font-semibold',
			'text-gray-500 dark:text-gray-400',
			'bg-gray-100 dark:bg-gray-700',
			'border border-gray-200 dark:border-gray-600',
			'rounded',
			'uppercase',
			className
		)}
	>
		{children}
	</kbd>
);
