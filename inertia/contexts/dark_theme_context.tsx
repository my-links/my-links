import { usePage } from '@inertiajs/react';
import { ReactNode, createContext, useEffect, useState } from 'react';
import { makeRequest } from '~/lib/request';

const LS_KEY = 'dark_theme';

export const DarkThemeContext = createContext({
  isDarkTheme: true,
  toggleDarkTheme: (_value: boolean) => {},
});

export default function DarkThemeContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { preferDarkTheme } = usePage<{ preferDarkTheme: boolean }>().props;
  const [isDarkTheme, setDarkTheme] = useState<boolean>(preferDarkTheme);
  const toggleDarkTheme = (value: boolean) => {
    setDarkTheme(value);
    makeRequest({
      method: 'POST',
      url: '/user/theme',
      body: {
        preferDarkTheme: value,
      },
    });
  };

  useEffect(() => {
    localStorage.setItem(LS_KEY, String(isDarkTheme));
  }, [isDarkTheme]);

  return (
    <DarkThemeContext.Provider
      value={{
        isDarkTheme,
        toggleDarkTheme,
      }}
    >
      {children}
    </DarkThemeContext.Provider>
  );
}
