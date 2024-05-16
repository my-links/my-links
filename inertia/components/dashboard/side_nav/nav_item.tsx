import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';

export const Item = styled.div(({ theme }) => ({
  cursor: 'pointer',
  userSelect: 'none',
  height: '40px',
  width: '250px',
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
    backgroundColor: theme.colors.secondary,
    outlineWidth: '1px',
    outlineStyle: 'solid',
  },
}));

export const ItemLink = Item.withComponent(Link);
