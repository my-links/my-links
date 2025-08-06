import { ApiRouteName } from '#shared/types/index';
import { Link } from '@inertiajs/react';
import { Anchor } from '@mantine/core';
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

export const InternalLink = ({
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

	return (
		<Anchor<'a' | typeof Link>
			component={forceRefresh ? 'a' : Link}
			href={url}
			style={style}
			onClick={onClick}
			className={className}
		>
			{children}
		</Anchor>
	);
};
