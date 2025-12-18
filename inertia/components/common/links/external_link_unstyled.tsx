import { Anchor, CSSProperties } from '@mantine/core';
import { AnchorHTMLAttributes, ReactNode } from 'react';

interface ExternalLinkUnstyledProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	children: ReactNode;
	style?: CSSProperties;
	title?: string;
	className?: string;
	newTab?: boolean;
}
export const ExternalLinkUnstyled = ({
	children,
	newTab = true,
	...props
}: ExternalLinkUnstyledProps) => (
	<Anchor
		component="a"
		target={newTab ? '_blank' : undefined}
		rel="noreferrer"
		{...props}
		style={{ ...props.style, textDecoration: 'none' }}
	>
		{children}
	</Anchor>
);
