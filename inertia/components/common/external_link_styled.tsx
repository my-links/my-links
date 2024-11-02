import { Anchor } from '@mantine/core';
import { AnchorHTMLAttributes, CSSProperties, ReactNode } from 'react';

export function ExternalLinkStyled({
	children,
	title,
	...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
	children: ReactNode;
	style?: CSSProperties;
	title?: string;
	className?: string;
}) {
	return (
		<Anchor<'a'>
			component="a"
			underline="never"
			target="_blank"
			rel="noreferrer"
			title={title}
			{...props}
		>
			{children}
		</Anchor>
	);
}
