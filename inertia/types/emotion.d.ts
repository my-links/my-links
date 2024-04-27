import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme extends theme {
    colors: {
      font: string;
      background: string;
      primary: string;

      lightBlack: string;
      black: string;
      darkBlack: string;

      white: string;
      gray: string;

      blue: string;
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
