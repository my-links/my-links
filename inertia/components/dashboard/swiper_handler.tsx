import styled from '@emotion/styled';

const SwiperHandler = styled.div(({ theme }) => ({
  height: '100%',
  width: '100%',
  display: 'flex',
  transition: `background-color ${theme.transition.delay}`,
}));

export default SwiperHandler;
