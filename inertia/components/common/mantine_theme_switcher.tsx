import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { TbMoonStars, TbSun } from 'react-icons/tb';

export function MantineThemeSwitcher() {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	return (
		<ActionIcon
			variant="light"
			aria-label="Toggle color scheme"
			onClick={() => toggleColorScheme()}
			size="lg"
		>
			{colorScheme === 'dark' ? <TbSun /> : <TbMoonStars />}
		</ActionIcon>
	);
}
