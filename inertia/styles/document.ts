import { css } from '@emotion/react';
import { theme } from './theme';

const documentStyle = css({
  'html, body, #app': {
    height: '100svh',
    width: '100svw',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '14px',
    color: theme.colors.font,
    backgroundColor: theme.colors.background,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    overflow: 'hidden',
  },
});

export default documentStyle;
