import styled from '@emotion/styled';
import { rgba } from '~/lib/color';

const Quotes = styled.p(({ theme }) => ({
  position: 'relative',
  width: 'fit-content',
  whiteSpace: 'pre-wrap',
  textAlign: 'center',
  fontStyle: 'italic',
  color: rgba(theme.colors.font, 0.75),

  '&::before, &::after': {
    position: 'absolute',
    fontFamily: 'sans-serif',
    fontSize: '2.25em',
  },

  '&::before': {
    left: '-0.65em',
    content: '"“"',
  },
  '&::after': {
    right: '-0.5em',
    content: '"”"',
  },
}));

export default Quotes;
