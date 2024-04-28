import styled from '@emotion/styled';

const Input = styled.input(({ theme }) => ({
  width: '100%',
  color: theme.colors.font,
  backgroundColor: theme.colors.white,
  padding: '0.75em',
  border: `1px solid ${theme.colors.lightestGrey}`,
  borderBottom: `2px solid ${theme.colors.lightestGrey}`,
  borderRadius: theme.border.radius,
  transition: theme.transition.delay,

  '&:focus': {
    borderBottom: `2px solid ${theme.colors.primary}`,
  },

  '&::placeholder': {
    fontStyle: 'italic',
    color: theme.colors.lightestGrey,
  },
}));

export default Input;
