import { Theme } from '@emotion/react';

const lightBlack = '#555';
const black = '#333';
const darkBlack = '#111';

const white = '#fff';
const gray = '#7c7c7c';

const blue = '#3f88c5';

export const theme: Theme = {
  colors: {
    font: black,
    background: white,
    primary: blue,

    lightBlack,
    black,
    darkBlack,

    white,
    gray,

    blue,
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
