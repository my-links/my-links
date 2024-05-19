import { Global, ThemeProvider, css, useTheme } from '@emotion/react';
import { ReactNode } from 'react';
import useDarkTheme from '~/hooks/use_dark_theme';
import { darkTheme, lightTheme } from '~/styles/theme';

export default function ContextThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isDarkTheme } = useDarkTheme();
  return (
    <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
}

function GlobalStyles() {
  const localTheme = useTheme();
  const cssReset = css({
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
      color: localTheme.colors.primary,
      textDecoration: 'none',
      borderBottom: '1px solid transparent',
    },

    b: {
      fontWeight: 600,
      letterSpacing: '0.5px',
    },

    'h1, h2, h3, h4, h5, h6': {
      fontWeight: '500',
      color: localTheme.colors.primary,
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

    hr: {
      color: localTheme.colors.secondary,
      width: '100%',
      marginBlock: '1em',
    },
  });

  const documentStyle = css({
    'html, body, #app': {
      height: '100svh',
      width: '100svw',
      fontFamily: "'Poppins', sans-serif",
      fontSize: '14px',
      color: localTheme.colors.font,
      backgroundColor: localTheme.colors.background,
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      overflow: 'hidden',
    },
  });

  const scrollbarStyle = css({
    /* width */
    '::-webkit-scrollbar': {
      height: '0.45em',
      width: '0.45em',
    },

    /* Track */
    '::-webkit-scrollbar-track': {
      borderRadius: localTheme.border.radius,
    },

    /* Handle */
    '::-webkit-scrollbar-thumb': {
      background: localTheme.colors.primary,
      borderRadius: localTheme.border.radius,

      '&:hover': {
        background: localTheme.colors.darkBlue,
      },
    },
  });

  return <Global styles={[cssReset, documentStyle, scrollbarStyle]} />;
}
