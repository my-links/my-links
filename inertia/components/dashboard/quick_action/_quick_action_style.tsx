import styled from '@emotion/styled';

const ActionStyle = styled.div(({ theme }) => ({
  border: '0 !important',
  margin: '0 !important',
  padding: '0 !important',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '& svg': {
    height: '20px',
    width: '20px',
    transition: theme.transition.delay,
  },

  '&:hover svg': {
    transform: 'scale(1.25)',
  },
}));

export default ActionStyle;
