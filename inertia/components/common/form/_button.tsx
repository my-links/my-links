import styled from '@emotion/styled';

const Button = styled.button(({ theme }) => ({
  cursor: 'pointer',
  width: '100%',
  textTransform: 'uppercase',
  fontSize: '14px',
  color: theme.colors.white,
  background: theme.colors.primary,
  padding: '0.75em',
  border: `1px solid ${theme.colors.primary}`,
  borderRadius: theme.border.radius,
  transition: theme.transition.delay,

  '&:disabled': {
    cursor: 'not-allowed',
    opacity: '0.5',
  },

  '&:not(:disabled):hover': {
    boxShadow: `${theme.colors.darkBlue} 0 0 3px 1px`,
    background: theme.colors.darkBlue,
    color: theme.colors.white,
  },
}));

export default Button;
