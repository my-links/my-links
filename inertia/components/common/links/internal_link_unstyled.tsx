import { ApiRouteName } from '#shared/types/index';
import { Link } from '@inertiajs/react';
import { useTuyau } from '@tuyau/inertia/react';
import { CSSProperties } from 'react';

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
	const tuyau = useTuyau();

	if ((!route && !href) || !tuyau) {
		throw new Error('InternalLink: route, href or tuyau is missing');
	}

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
