import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface IconLinkProps {
	href: string;
	icon: string;
	children: ReactNode;
	external?: boolean;
	onClick?: () => void;
	className?: string;
	fullWidth?: boolean;
}

const baseClassName =
	'flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium';

export const IconLink = ({
	href,
	icon,
	children,
	external = false,
	onClick,
	className = '',
	fullWidth = false,
}: IconLinkProps) => {
	const combinedClassName = `${baseClassName} ${fullWidth ? 'w-full' : ''} ${className}`;

	if (external) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={combinedClassName}
				onClick={onClick}
			>
				<i className={`${icon} h-5 min-w-5 block`} />
				<span>{children}</span>
			</a>
		);
	}

	return (
		<Link href={href} className={combinedClassName} onClick={onClick}>
			<i className={`${icon} h-5 min-w-5 block`} />
			<span>{children}</span>
		</Link>
	);
};
