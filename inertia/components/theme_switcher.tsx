import { Fragment } from 'react';
import Toggle from 'react-toggle';
import useDarkTheme from '~/hooks/use_dark_theme';

export default function ThemeSwitcher() {
	const { isDarkTheme, toggleDarkTheme } = useDarkTheme();

	if (typeof window === 'undefined') {
		return <Fragment />;
	}

	return (
		<Toggle
			onChange={({ target }) => toggleDarkTheme(target.checked)}
			checked={isDarkTheme}
			name="theme-switcher"
			id="theme-switcher"
			icons={{
				checked: '☀️',
				unchecked: '🌑',
			}}
		/>
	);
}
