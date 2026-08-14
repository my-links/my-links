import type { ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import {
	Avatar,
	Menu,
	MenuGroup,
	MenuItem,
	MenuSeparator,
	Modal,
	useThemeStore,
	type Theme,
} from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { useAuth } from '~/hooks/use_auth';
import { useTourStore } from '~/stores/tour_store';
import { ShortcutsModal } from '~/components/common/modals/shortcuts_modal';
import {
	PROJECT_DOCS_URL,
	PROJECT_EXTENSION_URL,
	PROJECT_REPO_GITHUB_URL,
} from '~/consts/project';

const EXTERNAL_HINT = '↗';

interface ThemeOption {
	value: Theme;
	icon: string;
	label: ReactNode;
}

const THEMES: readonly ThemeOption[] = [
	{
		value: 'light',
		icon: 'i-mdi-white-balance-sunny',
		label: <Trans>Light</Trans>,
	},
	{ value: 'dark', icon: 'i-mdi-weather-night', label: <Trans>Dark</Trans> },
	{ value: 'system', icon: 'i-mdi-monitor', label: <Trans>System</Trans> },
];

interface ThemeMenuItemProps {
	option: ThemeOption;
	isSelected: boolean;
	onSelect: (theme: Theme) => void;
}

function ThemeMenuItem({
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

/**
 * Everything that concerns the account rather than the content: preferences,
 * help, and the way out.
 */
export function AccountMenu() {
	const auth = useAuth();
	const { theme, setTheme } = useThemeStore();
	const { startTour } = useTourStore();

	const fullname = auth.user?.fullname ?? '';

	const handleOpenSettings = () => {
		router.visit(urlFor('user.settings'));
	};

	const handleOpenAdmin = () => {
		router.visit(urlFor('admin.dashboard'));
	};

	const handleOpenShortcuts = () => {
		void Modal.call({
			title: <Trans>Keyboard shortcuts</Trans>,
			children: <ShortcutsModal />,
		});
	};

	const handleLogout = () => {
		router.post(urlFor('auth.logout'));
	};

	return (
		<Menu
			side="top"
			align="start"
			trigger={
				<button
					type="button"
					className="w-full cursor-pointer flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
				>
					<Avatar name={fullname} size="sm" />
					<span className="flex-1 truncate text-left text-sm font-medium text-gray-900 dark:text-white">
						{fullname}
					</span>
					<i className="i-mdi-chevron-up h-4 w-4 text-gray-500 dark:text-gray-400" />
				</button>
			}
		>
			<MenuItem icon="i-mdi-cog" onClick={handleOpenSettings}>
				<Trans>Settings</Trans>
			</MenuItem>

			<MenuSeparator />

			<MenuGroup label={<Trans>Theme</Trans>}>
				{THEMES.map((option) => (
					<ThemeMenuItem
						key={option.value}
						option={option}
						isSelected={theme === option.value}
						onSelect={setTheme}
					/>
				))}
			</MenuGroup>

			<MenuSeparator />

			<MenuItem icon="i-mdi-play-circle-outline" onClick={startTour}>
				<Trans>Replay the tour</Trans>
			</MenuItem>
			<MenuItem icon="i-mdi-keyboard-outline" onClick={handleOpenShortcuts}>
				<Trans>Keyboard shortcuts</Trans>
			</MenuItem>
			<MenuItem
				icon="i-mdi-book-open-variant"
				href={PROJECT_DOCS_URL}
				target="_blank"
				trailing={EXTERNAL_HINT}
			>
				<Trans>Documentation</Trans>
			</MenuItem>
			<MenuItem
				icon="i-mdi-extension"
				href={PROJECT_EXTENSION_URL}
				target="_blank"
				trailing={EXTERNAL_HINT}
			>
				<Trans>Browser extension</Trans>
			</MenuItem>
			<MenuItem
				icon="i-mdi-github"
				href={PROJECT_REPO_GITHUB_URL}
				target="_blank"
				trailing={EXTERNAL_HINT}
			>
				<Trans>Source code</Trans>
			</MenuItem>

			<MenuSeparator />

			{auth.isAdmin && (
				<MenuItem icon="i-mdi-shield-account" onClick={handleOpenAdmin}>
					<Trans>Admin</Trans>
				</MenuItem>
			)}
			<MenuItem icon="i-mdi-logout" danger onClick={handleLogout}>
				<Trans>Logout</Trans>
			</MenuItem>
		</Menu>
	);
}
