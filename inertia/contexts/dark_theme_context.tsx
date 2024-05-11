import { ReactNode, createContext, useEffect, useState } from 'react';

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
  const [isDarkTheme, setDarkTheme] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined')
      return true;

    const doUserPreferDarkTheme = window?.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    return (
      localStorage.getItem(LS_KEY) === 'true' ?? doUserPreferDarkTheme ?? true
    );
  });
  const toggleDarkTheme = (value: boolean) => setDarkTheme(value);

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
