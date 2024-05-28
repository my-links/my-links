import { Theme } from '@emotion/react';
import { rgba } from '~/lib/color';
import { border } from '~/styles/border';
import {
  darkBlue,
  darkestBlue,
  lightBlue,
  lightRed,
  lightestBlue,
  primaryColor,
} from '~/styles/common_colors';
import { media } from '~/styles/media_queries';
import { transition } from '~/styles/transition';

export const lightTheme: Theme = {
  colors: {
    font: '#333',
    background: '#f0eef6',
    primary: primaryColor,
    secondary: '#fff',

    black: '#333',
    white: '#ffffff',

    lightGrey: '#dadce0',
    grey: '#888888',

    lightestBlue,
    lightBlue,
    blue: primaryColor,
    darkBlue,
    darkestBlue,

    green: 'green',

    lightRed,

    yellow: '#FF8A08',

    boxShadow: `0 0 1em 0 ${rgba('#aaa', 0.4)}`,
  },

  border,
  media,
  transition,
};
