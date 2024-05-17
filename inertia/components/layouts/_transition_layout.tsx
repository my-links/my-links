import styled from '@emotion/styled';
import { fadeInScale } from '~/styles/keyframes';

const TransitionLayout = styled.div(({ theme }) => ({
  animation: `${theme.transition.delay} ${fadeInScale} both`,
}));

export default TransitionLayout;
