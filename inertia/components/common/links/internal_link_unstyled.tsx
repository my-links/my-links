import { ApiRouteName } from '#shared/types/index';
import { Link } from '@inertiajs/react';
import { CSSProperties } from 'react';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';

interface InternalLinkProps {
	children: React.ReactNode;
	onClick?: (event: React.MouseEvent<any>) => void;
	route?: ApiRouteName;
	href?: string;
	forceRefresh?: boolean;
	style?: CSSProperties;
	className?: string;
	params?: Record<string, string>;
}

export const InternalLinkUnstyled = ({
	children,
	onClick,
	route,
	href,
	forceRefresh,
	style,
	className,
	params,
}: InternalLinkProps) => {
	if (!route && !href) {
		throw new Error('InternalLink: route or href is required');
	}

	const tuyau = useTuyauRequired();
	const url = route ? tuyau.$route(route, params).path : href;
	if (!url) {
		throw new Error('InternalLink: url not found');
	}

	if (forceRefresh) {
		return (
			<a
				href={url}
				style={{ ...style, textDecoration: 'none' }}
				onClick={onClick}
				className={className}
			>
				{children}
			</a>
		);
	}

	return (
		<Link
			href={url}
			style={{ ...style, textDecoration: 'none' }}
			onClick={onClick}
			className={className}
		>
			{children}
		</Link>
	);
};
