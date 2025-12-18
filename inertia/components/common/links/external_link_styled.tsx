import { Anchor } from '@mantine/core';
import { AnchorHTMLAttributes, CSSProperties, ReactNode } from 'react';

interface ExternalLinkStyledProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	children: ReactNode;
	style?: CSSProperties;
	title?: string;
	className?: string;
}

export const ExternalLinkStyled = ({
	children,
	title,
	href,
	...props
}: ExternalLinkStyledProps) => (
	<Anchor<'a'>
		component="a"
		target="_blank"
		rel="noreferrer"
		title={title}
		href={href}
		{...props}
	>
		{children}
	</Anchor>
);
