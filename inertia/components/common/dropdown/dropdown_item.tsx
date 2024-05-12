import styled from '@emotion/styled';

const DropdownItem = styled.div(({ theme }) => ({
  fontSize: '14px',
  padding: '8px 12px',
  display: 'flex',
  gap: '0.35em',
  alignItems: 'center',
  borderRadius: theme.border.radius,

  '&:hover': {
    backgroundColor: theme.colors.background,
  },
}));

export default DropdownItem;
