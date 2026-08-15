import { t } from '@lingui/core/macro';
import { IconButton } from '@minimalstuff/ui';
import { Link } from '@adonisjs/inertia/react';

import { useSidebarMode } from '~/hooks/use_sidebar_mode';
import { SearchButton } from '~/components/dashboard/search/search_button';

interface SidebarHeaderProps {
	onToggleSidebar: () => void;
	onOpenSearch: () => void;
}

/**
 * The rail has room for one thing on its top row, and it has to be the toggle
 * that gets the sidebar back: the logo steps aside for it rather than sharing.
 */
export function SidebarHeader({
	onToggleSidebar,
	onOpenSearch,
}: Readonly<SidebarHeaderProps>) {
	const isRail = useSidebarMode() === 'rail';

	const toggleButton = (
		<IconButton
			icon="i-ant-design-menu-outlined"
			onClick={onToggleSidebar}
			aria-label={t`Toggle sidebar`}
			title={t`Toggle sidebar`}
			variant="outline"
		/>
	);

	return (
		<div className="px-2 pt-2 pb-1 space-y-2">
			{isRail ? (
				<div className="flex justify-center">{toggleButton}</div>
			) : (
				<div className="flex items-center justify-between gap-2">
					<Link
						route="home"
						className="block hover:opacity-80 transition-opacity"
						aria-label="MyLinks"
					>
						<img
							src="/logo.png"
							alt="MyLinks's logo"
							referrerPolicy="no-referrer"
							className="h-8"
						/>
					</Link>
					{toggleButton}
				</div>
			)}

			{isRail ? (
				<div className="flex justify-center">
					<IconButton
						icon="i-ion-search"
						onClick={onOpenSearch}
						data-tour="header-search"
						aria-label={t`Search`}
						title={t`Search`}
						variant="outline"
					/>
				</div>
			) : (
				<SearchButton onClick={onOpenSearch} data-tour="header-search" />
			)}
		</div>
	);
}
