import { Theme } from '@emotion/react';
import { rgba } from '~/lib/color';

export const primaryColor = '#3f88c5';
export const primaryDarkColor = '#005aa5';

const lightestBlue = '#d3e8fa';
const lightBlue = '#82c5fede';
const darkBlue = primaryDarkColor;

const lightRed = '#FF5A5A';

const border: Theme['border'] = {
  radius: '3px',
};

const media: Theme['media'] = {
  mobile: '768px',
  tablet: '1024px',
  small_desktop: '1280px',
  medium_desktop: '1440px',
  large_desktop: '1920px',
  xlarge_desktop: '2560px',
};

const transition: Theme['transition'] = {
  delay: '0.15s',
};

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

    lightRed,

    yellow: '#FF8A08',

    boxShadow: `0 0 1em 0 ${rgba('#aaa', 0.4)}`,
  },

  border,
  media,
  transition,
};

export const darkTheme: Theme = {
  colors: {
    font: '#f0eef6',
    background: '#222831',
    primary: '#4fadfc',
    secondary: '#323a47',

    black: '#333',
    white: '#ffffff',

    lightGrey: '#323a47',
    grey: '#999999',

    lightestBlue,
    lightBlue,
    blue: '#4fadfc',
    darkBlue,

    lightRed,

    yellow: '#ffc107',

    boxShadow: `0 0 1em 0 ${rgba('#111', 0.4)}`,
  },

  border,
  media,
  transition,
};
