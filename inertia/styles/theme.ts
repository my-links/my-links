import { Theme } from '@emotion/react';

const lightBlack = '#555';
const black = '#333';
const darkBlack = '#111';

const white = '#fff';

const lightestGrey = '#dadce0';
const lightGrey = '#f0eef6';
const grey = '#aaa';
const darkGrey = '#4b5563';

const lightestBlue = '#d3e8fa';
const lightBlue = '#82c5fede';
const blue = '#3f88c5';
const darkBlue = '#005aa5';
const darkestBlue = '#1f2937';

const lightRed = '#ffbabab9';
const red = '#d8000c';

const lightGreen = '#c1ffbab9';
const green = 'green';

export const theme: Theme = {
  colors: {
    font: black,
    background: lightGrey,
    primary: blue,

    lightBlack,
    black,
    darkBlack,

    white,

    lightestGrey,
    lightGrey,
    grey,
    darkGrey,

    lightestBlue,
    lightBlue,
    blue,
    darkBlue,
    darkestBlue,

    lightRed,
    red,

    lightGreen,
    green,
  },

  border: {
    radius: '5px',
  },

  media: {
    mobile: '768px',
    tablet: '1024px',
    small_desktop: '1280px',
    medium_desktop: '1440px',
    large_desktop: '1920px',
    xlarge_desktop: '2560px',
  },

  transition: {
    delay: '0.15s',
  },
};
