import { Link } from '@adonisjs/inertia/react';

import { cn } from '~/lib/cn';
import { useAuth } from '~/hooks/use_auth';
import { IconLink } from '~/components/common/navigation/icon_link';
import { AccountMenu } from '~/components/common/navigation/account_menu';
import { NAVBAR_LINKS } from '~/components/common/navigation/navbar_links';
import { MobileGuestAuthActions } from '~/components/common/navigation/mobile_guest_auth_actions';

type NavbarMobileMenuProps = {
	isOpen: boolean;
	onNavigate: () => void;
};

export function NavbarMobileMenu({
	isOpen,
	onNavigate,
}: Readonly<NavbarMobileMenuProps>) {
	const auth = useAuth();

	return (
		<div
			className={cn(
				'lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg shadow-lg transition-all duration-300 ease-in-out overflow-hidden',
				isOpen
					? 'opacity-100 translate-y-0 max-h-screen'
					: 'opacity-0 -translate-y-4 max-h-0 pointer-events-none'
			)}
		>
			<div className="py-4 px-4 space-y-4">
				<div className="space-y-2">
					{NAVBAR_LINKS.map((link) => (
						<IconLink
							key={link.href}
							href={link.href}
							icon={link.icon}
							external
							onClick={onNavigate}
							fullWidth
						>
							{link.label}
						</IconLink>
					))}
				</div>
				<div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
					{auth.isAuthenticated ? (
						<>
							<Link
								route="collection.favorites"
								className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium w-full"
								onClick={onNavigate}
							>
								<i className="i-mdi-view-dashboard h-5 min-w-5 block" />
								Dashboard
							</Link>
							{auth.isAdmin && (
								<Link
									route="admin.dashboard"
									className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium w-full"
									onClick={onNavigate}
								>
									<i className="i-mdi-shield-account h-5 min-w-5 block" />
									Admin
								</Link>
							)}
							<AccountMenu side="bottom" />
						</>
					) : (
						<MobileGuestAuthActions onNavigate={onNavigate} />
					)}
				</div>
			</div>
		</div>
	);
}
