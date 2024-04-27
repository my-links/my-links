import { Global, ThemeProvider } from '@emotion/react';
import { ReactNode } from 'react';
import documentStyle from '~/styles/document';
import { cssReset } from '~/styles/reset';
import { theme } from '~/styles/theme';

export default function BaseLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
      <Global styles={[cssReset, documentStyle]} />
    </>
  );
}
