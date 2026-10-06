import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import {
	Avatar,
	Menu,
	MenuItem,
	MenuSeparator,
	Modal,
	useThemeStore,
	type MenuSide,
} from '@minimalstuff/ui';

import { cn } from '~/lib/cn';
import { urlFor } from '~/lib/tuyau';
import { useAuth } from '~/hooks/use_auth';
import { RAIL_ITEM_CLASS } from '~/consts/sidebar';
import { useTourStore } from '~/stores/tour_store';
import { ShortcutsModal } from '~/components/common/modals/shortcuts_modal';
import { AccountMenuThemeGroup } from '~/components/common/navigation/account_menu_theme_group';
import { AccountMenuExternalLinks } from '~/components/common/navigation/account_menu_external_links';

type AccountMenuProps = {
	side?: MenuSide;
	/** Shows the avatar alone, for the collapsed sidebar rail. */
	iconOnly?: boolean;
};

/**
 * Everything that concerns the account rather than the content: preferences,
 * help, and the way out. `side` follows where it is anchored: `top` at the
 * foot of the sidebar, `bottom` in a header.
 */
export function AccountMenu({
	side = 'top',
	iconOnly = false,
}: Readonly<AccountMenuProps>) {
	const auth = useAuth();
	const { theme, setTheme } = useThemeStore();
	const { startTour } = useTourStore();

	const fullname = auth.user?.fullname ?? '';
	const chevronClass =
		side === 'top' ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down';

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
			side={side}
			align="start"
			trigger={
				<button
					type="button"
					title={iconOnly ? fullname : undefined}
					aria-label={iconOnly ? fullname : undefined}
					className={cn(
						'cursor-pointer flex items-center gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors',
						iconOnly ? RAIL_ITEM_CLASS : 'w-full px-2 py-1.5'
					)}
				>
					<Avatar name={fullname} size="sm" />
					{!iconOnly && (
						<>
							<span className="flex-1 truncate text-left text-sm font-medium text-gray-900 dark:text-white">
								{fullname}
							</span>
							<i
								className={cn(
									chevronClass,
									'h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400'
								)}
							/>
						</>
					)}
				</button>
			}
		>
			<MenuItem icon="i-mdi-cog" onClick={handleOpenSettings}>
				<Trans>Settings</Trans>
			</MenuItem>

			<MenuSeparator />

			<AccountMenuThemeGroup theme={theme} onSelect={setTheme} />

			<MenuSeparator />

			<MenuItem icon="i-mdi-play-circle-outline" onClick={startTour}>
				<Trans>Replay the tour</Trans>
			</MenuItem>
			<MenuItem icon="i-mdi-keyboard-outline" onClick={handleOpenShortcuts}>
				<Trans>Keyboard shortcuts</Trans>
			</MenuItem>
			<AccountMenuExternalLinks />

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
