import type { ReactNode } from 'react';
import { MenuItem, type Theme } from '@minimalstuff/ui';

export type ThemeOption = {
	value: Theme;
	icon: string;
	label: ReactNode;
};

type ThemeMenuItemProps = {
	option: ThemeOption;
	isSelected: boolean;
	onSelect: (theme: Theme) => void;
};

export function ThemeMenuItem({
	option,
	isSelected,
	onSelect,
}: Readonly<ThemeMenuItemProps>) {
	const handleSelect = () => onSelect(option.value);

	return (
		<MenuItem icon={option.icon} selected={isSelected} onClick={handleSelect}>
			{option.label}
		</MenuItem>
	);
}
