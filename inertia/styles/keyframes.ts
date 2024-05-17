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

export const fadeInScale = keyframes({
  from: {
    opacity: 0,
    transform: 'scale(0.95)',
  },
  to: {
    opacity: 1,
    transform: 'scale(1)',
  },
});
