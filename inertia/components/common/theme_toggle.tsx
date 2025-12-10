import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>('system');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);

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

	if (!mounted) {
		return null;
	}

	const getIcon = () => {
		if (theme === 'light') {
			return (
				<svg
					className="w-5 h-5 text-yellow-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
					/>
				</svg>
			);
		} else if (theme === 'dark') {
			return (
				<svg
					className="w-5 h-5 text-gray-700 dark:text-yellow-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
					/>
				</svg>
			);
		} else {
			return (
				<svg
					className="w-5 h-5 text-blue-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
			);
		}
	};

	return (
		<button
			onClick={toggleTheme}
			className="fixed top-4 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
			aria-label={`Thème actuel: ${theme}`}
		>
			{getIcon()}
		</button>
	);
}
