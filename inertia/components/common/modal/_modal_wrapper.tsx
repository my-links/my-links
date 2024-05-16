import styled from '@emotion/styled';
import { rgba } from '~/lib/color';

const ModalWrapper = styled.div(({ theme }) => ({
  zIndex: 9999,
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  background: rgba(theme.colors.black, 0.35),
  backdropFilter: 'blur(0.25em)',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
}));

export default ModalWrapper;
