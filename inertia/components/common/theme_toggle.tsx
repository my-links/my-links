import { useEffect, useState } from 'react';
import { useIsClient } from '~/hooks/use_is_client';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>('system');
	const isClient = useIsClient();

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme') as Theme;
		if (savedTheme) {
			setTheme(savedTheme);
			applyTheme(savedTheme);
		} else {
			setTheme('system');
			applyTheme('system');
		}
	}, []);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		const handleSystemThemeChange = () => {
			if (theme === 'system') {
				applyTheme('system');
			}
		};

		mediaQuery.addEventListener('change', handleSystemThemeChange);

		return () => {
			mediaQuery.removeEventListener('change', handleSystemThemeChange);
		};
	}, [theme]);

	const applyTheme = (newTheme: Theme) => {
		const root = document.documentElement;

		if (newTheme === 'system') {
			const systemPrefersDark = window.matchMedia(
				'(prefers-color-scheme: dark)'
			).matches;
			if (systemPrefersDark) {
				root.classList.add('dark');
			} else {
				root.classList.remove('dark');
			}
		} else if (newTheme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	};

	const toggleTheme = () => {
		let newTheme: Theme;

		if (theme === 'light') {
			newTheme = 'dark';
		} else if (theme === 'dark') {
			newTheme = 'system';
		} else {
			newTheme = 'light';
		}

		setTheme(newTheme);
		applyTheme(newTheme);
		localStorage.setItem('theme', newTheme);
	};

	const getIcon = () => {
		if (theme === 'light') {
			return (
				<div
					className="i-tabler-sun w-5 h-5 text-yellow-500"
					style={{ width: '20px', height: '20px' }}
				/>
			);
		} else if (theme === 'dark') {
			return (
				<div
					className="i-tabler-moon-stars w-5 h-5 text-gray-700 dark:text-yellow-500"
					style={{ width: '20px', height: '20px' }}
				/>
			);
		} else {
			return (
				<div
					className="i-tabler-device-desktop w-5 h-5 text-blue-500"
					style={{ width: '20px', height: '20px' }}
				/>
			);
		}
	};

	return (
		<button
			onClick={toggleTheme}
			className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer"
			aria-label={`Thème actuel: ${theme}`}
		>
			{isClient ? (
				getIcon()
			) : (
				<div
					className="i-tabler-device-desktop w-5 h-5 text-gray-400"
					style={{ width: '20px', height: '20px' }}
				/>
			)}
		</button>
	);
}
