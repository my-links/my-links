import styled from '@emotion/styled';
import { HtmlHTMLAttributes, ReactNode, useRef } from 'react';
import DropdownContainer from '~/components/common/dropdown/dropdown_container';
import DropdownLabel from '~/components/common/dropdown/dropdown_label';
import useClickOutside from '~/hooks/use_click_outside';
import useToggle from '~/hooks/use_modal';
import useShortcut from '~/hooks/use_shortcut';

const DropdownStyle = styled.div<{ opened: boolean; svgSize?: number }>(
	({ opened, theme, svgSize = 24 }) => ({
		cursor: 'pointer',
		userSelect: 'none',
		position: 'relative',
		minWidth: 'fit-content',
		width: 'fit-content',
		maxWidth: '250px',
		backgroundColor: opened ? theme.colors.secondary : theme.colors.background,
		padding: '4px',
		borderRadius: theme.border.radius,

		'&:hover': {
			backgroundColor: theme.colors.secondary,
		},

		'& svg': {
			height: `${svgSize}px`,
			width: `${svgSize}px`,
		},
	})
);

export default function Dropdown({
	children,
	label,
	className,
	svgSize,
	onClick,
}: HtmlHTMLAttributes<HTMLDivElement> & {
	label: ReactNode | string;
	className?: string;
	svgSize?: number;
}) {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { isShowing, toggle, close } = useToggle();

	useClickOutside(dropdownRef, close);
	useShortcut('ESCAPE_KEY', close, { disableGlobalCheck: true });

	return (
		<DropdownStyle
			opened={isShowing}
			onClick={(event) => {
				onClick?.(event);
				toggle();
			}}
			ref={dropdownRef}
			className={className}
			svgSize={svgSize}
		>
			<DropdownLabel>{label}</DropdownLabel>
			<DropdownContainer show={isShowing}>{children}</DropdownContainer>
		</DropdownStyle>
	);
}
