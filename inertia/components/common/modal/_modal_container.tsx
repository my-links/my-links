import styled from '@emotion/styled';

const ModalContainer = styled.div(({ theme }) => ({
  minWidth: '500px',
  background: theme.colors.secondary,
  padding: '1em',
  borderRadius: theme.border.radius,
  marginTop: '6em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  boxShadow: theme.colors.boxShadow,

  [`@media (max-width: ${theme.media.mobile})`]: {
    maxHeight: 'calc(100% - 2em)',
    width: 'calc(100% - 2em)',
    minWidth: 'unset',
    marginTop: '1em',
  },
}));

export default ModalContainer;
