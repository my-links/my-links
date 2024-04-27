import { css } from '@emotion/react';

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

  'a': {
    width: 'fit-content',
    color: '#3f88c5',
    textDecoration: 'none',
    borderBottom: '1px solid transparent',
  },

  'b': {
    fontWeight: 600,
    letterSpacing: '0.5px',
  },

  'h1, h2, h3, h4, h5, h6': {
    fontWeight: '400',
    margin: '1em 0',
  },
});
