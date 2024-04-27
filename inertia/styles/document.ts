import { css } from '@emotion/react';
import { theme } from './theme';

const documentStyle = css({
  'html, body, #app': {
    height: '100svh',
    width: '100svw',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontSize: '17px',
    color: theme.colors.font,
    backgroundColor: theme.colors.background,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    overflow: 'hidden',
  },
});

export default documentStyle;
