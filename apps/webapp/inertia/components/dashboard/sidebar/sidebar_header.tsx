import { Link } from '@adonisjs/inertia/react';

import { SearchButton } from '~/components/dashboard/search/search_button';

interface SidebarHeaderProps {
	onOpenSearch: () => void;
}

export const SidebarHeader = ({
	onOpenSearch,
}: Readonly<SidebarHeaderProps>) => (
	<div className="px-2 pt-2 pb-1 space-y-2">
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
		<SearchButton onClick={onOpenSearch} data-tour="header-search" />
	</div>
);
