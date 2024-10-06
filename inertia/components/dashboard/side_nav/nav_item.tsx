import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import ExternalLink from '~/components/common/external_link';
import { rgba } from '~/lib/color';

export const Item = styled.div(({ theme }) => ({
	userSelect: 'none',
	height: '40px',
	width: '100%',
	color: theme.colors.font,
	backgroundColor: theme.colors.background,
	padding: '8px 12px',
	borderRadius: theme.border.radius,
	display: 'flex',
	gap: '.75em',
	alignItems: 'center',

	'& > svg': {
		height: '24px',
		width: '24px',
	},

	// Disable hover effect for UserCard
	'&:hover:not(.disable-hover)': {
		cursor: 'pointer',
		backgroundColor: rgba(theme.colors.font, 0.1),
	},
}));

export const ItemLink = Item.withComponent(Link);
export const ItemExternalLink = Item.withComponent(ExternalLink);
