import { css } from '@emotion/react';
import { theme } from '~/styles/theme';

export const cssReset = css({
  '*': {
    boxSizing: 'border-box',
    outline: 0,
    margin: 0,
    padding: 0,
    scrollBehavior: 'smooth',
  },

  '.reset': {
    backgroundColor: 'inherit',
    color: 'inherit',
    padding: 0,
    margin: 0,
    border: 0,
  },

  a: {
    width: 'fit-content',
    color: '#3f88c5',
    textDecoration: 'none',
    borderBottom: '1px solid transparent',
  },

  b: {
    fontWeight: 600,
    letterSpacing: '0.5px',
  },

  'h1, h2, h3, h4, h5, h6': {
    fontWeight: '500',
    color: theme.colors.primary,
  },

  kbd: {
    textShadow: '0 1px 0 #fff',
    fontSize: '12px',
    color: 'rgb(51, 51, 51)',
    backgroundColor: 'rgb(247, 247, 247)',
    padding: '0.25em 0.5em',
    borderRadius: '3px',
    border: '1px solid rgb(204, 204, 204)',
    boxShadow: '0 1px 0 rgba(0, 0, 0, 0.2), 0 0 0 2px #ffffff inset',
    display: 'inline-block',
  },
});
