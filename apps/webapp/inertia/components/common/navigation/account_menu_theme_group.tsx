import { Trans } from '@lingui/react/macro';
import { MenuGroup, type Theme } from '@minimalstuff/ui';

import {
	ThemeMenuItem,
	type ThemeOption,
} from '~/components/common/navigation/theme_menu_item';

const THEMES: readonly ThemeOption[] = [
	{
		value: 'light',
		icon: 'i-mdi-white-balance-sunny',
		label: <Trans>Light</Trans>,
	},
	{ value: 'dark', icon: 'i-mdi-weather-night', label: <Trans>Dark</Trans> },
	{ value: 'system', icon: 'i-mdi-monitor', label: <Trans>System</Trans> },
];

type AccountMenuThemeGroupProps = {
	theme: Theme;
	onSelect: (theme: Theme) => void;
};

export const AccountMenuThemeGroup = ({
	theme,
	onSelect,
}: Readonly<AccountMenuThemeGroupProps>) => (
	<MenuGroup label={<Trans>Theme</Trans>}>
		{THEMES.map((option) => (
			<ThemeMenuItem
				key={option.value}
				option={option}
				isSelected={theme === option.value}
				onSelect={onSelect}
			/>
		))}
	</MenuGroup>
);
