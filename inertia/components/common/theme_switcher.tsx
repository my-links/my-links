import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { makeRequest } from '~/lib/request';

export function ThemeSwitcher() {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const handleThemeChange = () => {
		toggleColorScheme();
		makeRequest({
			url: '/user/theme',
			method: 'POST',
			body: { theme: colorScheme === 'dark' ? 'light' : 'dark' },
		});
	};
	return (
		<ActionIcon
			variant="light"
			aria-label="Toggle color scheme"
			onClick={handleThemeChange}
			size="lg"
		>
			{colorScheme === 'dark' ? (
				<div className="i-tabler-sun" />
			) : (
				<div className="i-tabler-moon-stars" />
			)}
		</ActionIcon>
	);
}
