import { ApiRouteName } from '#shared/types/index';
import { Link } from '@inertiajs/react';
import { Anchor } from '@mantine/core';
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
	if (!route && !href) {
		throw new Error('InternalLink: route or href is required');
	}

	const tuyau = useTuyauRequired();
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
