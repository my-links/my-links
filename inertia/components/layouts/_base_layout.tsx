import { ReactNode } from 'react';
import ContextThemeProvider from '~/components/layouts/_theme_layout';
import DarkThemeContextProvider from '~/contexts/dark_theme_context';

const BaseLayout = ({ children }: { children: ReactNode }) => (
  <DarkThemeContextProvider>
    <ContextThemeProvider>{children}</ContextThemeProvider>
  </DarkThemeContextProvider>
);

export default BaseLayout;
