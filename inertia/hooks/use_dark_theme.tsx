import { useContext } from 'react';
import { DarkThemeContext } from '~/contexts/dark_theme_context';

const useDarkTheme = () => useContext(DarkThemeContext);
export default useDarkTheme;
