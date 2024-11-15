import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { TbMoonStars, TbSun } from 'react-icons/tb';
import { makeRequest } from '~/lib/request';

export function MantineThemeSwitcher() {
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
			{colorScheme === 'dark' ? <TbSun /> : <TbMoonStars />}
		</ActionIcon>
	);
}
