import { useMantineColorScheme, ActionIcon } from '@mantine/core';
import { TbSun, TbMoonStars } from 'react-icons/tb';

export function MantineThemeSwitcher() {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	return (
		<ActionIcon
			variant="default"
			aria-label="Toggle color scheme"
			onClick={() => toggleColorScheme()}
			size="lg"
		>
			{colorScheme === 'dark' ? <TbSun /> : <TbMoonStars />}
		</ActionIcon>
	);
}
