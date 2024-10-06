import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';

const DropdownItemBase = styled('div', {
	shouldForwardProp: (propName) => propName !== 'danger',
})<{ danger?: boolean }>(({ theme, danger }) => ({
	fontSize: '14px',
	whiteSpace: 'nowrap',
	color: danger ? theme.colors.lightRed : theme.colors.primary,
	padding: '8px 12px',
	borderRadius: theme.border.radius,

	'&:hover': {
		backgroundColor: theme.colors.background,
	},
}));

const DropdownItemButton = styled(DropdownItemBase)({
	display: 'flex',
	gap: '0.75em',
	alignItems: 'center',
});

const DropdownItemLink = styled(DropdownItemBase.withComponent(Link))({
	width: '100%',
	display: 'flex',
	gap: '0.75em',
	alignItems: 'center',
});

export { DropdownItemButton, DropdownItemLink };
