import { t } from '@lingui/core/macro';
import { IconButton } from '@minimalstuff/ui';
import { Link } from '@adonisjs/inertia/react';

import { cn } from '~/lib/cn';
import { useSidebarMode } from '~/hooks/use_sidebar_mode';
import { SearchButton } from '~/components/dashboard/search/search_button';

interface SidebarHeaderProps {
	onOpenSearch: () => void;
}

export function SidebarHeader({ onOpenSearch }: Readonly<SidebarHeaderProps>) {
	const isRail = useSidebarMode() === 'rail';

	return (
		<div className="px-2 pt-2 pb-1 space-y-2">
			<Link
				route="home"
				className={cn(
					'block hover:opacity-80 transition-opacity',
					isRail && 'flex justify-center'
				)}
				aria-label="MyLinks"
			>
				<img
					src="/logo.png"
					alt="MyLinks's logo"
					referrerPolicy="no-referrer"
					className="h-8"
				/>
			</Link>

			{isRail ? (
				<IconButton
					icon="i-ion-search"
					onClick={onOpenSearch}
					data-tour="header-search"
					aria-label={t`Search`}
					title={t`Search`}
					variant="outline"
					className="mx-auto"
				/>
			) : (
				<SearchButton onClick={onOpenSearch} data-tour="header-search" />
			)}
		</div>
	);
}
