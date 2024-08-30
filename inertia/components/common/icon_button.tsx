import styled from '@emotion/styled';

const IconButton = styled.button(({ theme }) => ({
  cursor: 'pointer',
  height: '2rem',
  width: '2rem',
  fontSize: '1rem',
  color: theme.colors.font,
  backgroundColor: theme.colors.grey,
  borderRadius: '50%',
  border: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.15,
  },
}));

export default IconButton;
