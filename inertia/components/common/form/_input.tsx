import styled from '@emotion/styled';

const Input = styled.input(({ theme }) => ({
  width: '100%',
  color: theme.colors.font,
  backgroundColor: theme.colors.secondary,
  padding: '0.75em',
  border: `1px solid ${theme.colors.lightGrey}`,
  borderBottom: `2px solid ${theme.colors.lightGrey}`,
  borderRadius: theme.border.radius,
  transition: theme.transition.delay,

  '&:focus': {
    borderBottom: `2px solid ${theme.colors.primary}`,
  },

  '&::placeholder': {
    fontStyle: 'italic',
    color: theme.colors.grey,
  },
}));

export default Input;
