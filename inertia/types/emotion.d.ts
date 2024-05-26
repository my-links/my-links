import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme extends theme {
    colors: {
      font: string;
      background: string;
      primary: string;
      secondary: string;

      black: string;
      white: string;

      lightGrey: string;
      grey: string;

      lightestBlue: string;
      lightBlue: string;
      blue: string;
      darkBlue: string;
      darkestBlue: string;

      green: string;

      lightRed: string;

      yellow: string;

      boxShadow: string;
    };

    border: {
      radius: string;
    };

    media: {
      mobile: string;
      tablet: string;
      small_desktop: string;
      medium_desktop: string;
      large_desktop: string;
      xlarge_desktop: string;
    };

    transition: {
      delay: string;
    };
  }
}
