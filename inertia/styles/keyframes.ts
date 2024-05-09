import { keyframes } from '@emotion/react';

export const fadeIn = keyframes({
  '0%': {
    opacity: 0,
  },
  '100%': {
    opacity: 1,
  },
});

export const rotate = keyframes({
  to: {
    transform: 'rotate(0deg)',
  },
  from: {
    transform: 'rotate(360deg)',
  },
});
