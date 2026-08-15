import { useEffect, useState } from 'react';
import { Link } from '@adonisjs/inertia/react';

import { cn } from '~/lib/cn';
import { useAuth } from '~/hooks/use_auth';
import { MOBILE_BREAKPOINT } from '~/consts/breakpoints';
import { IconLink } from '~/components/common/navigation/icon_link';
import { AccountMenu } from '~/components/common/navigation/account_menu';
import { NAVBAR_LINKS } from '~/components/common/navigation/navbar_links';
import { GuestAuthActions } from '~/components/common/navigation/guest_auth_actions';
import { MobileGuestAuthActions } from '~/components/common/navigation/mobile_guest_auth_actions';

export function Navbar() {
	const auth = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen((prev) => !prev);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	useEffect(() => {
		if (typeof window === 'undefined') return;

		let observer: ResizeObserver | null = null;

		const checkAndCloseMenu = () => {
			if (window.innerWidth >= MOBILE_BREAKPOINT) {
				closeMobileMenu();
			}
		};

		observer = new ResizeObserver(() => {
			checkAndCloseMenu();
		});

		observer.observe(document.body);

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	}, []);

	return (
		<nav className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
			<div className="h-[64px] flex justify-between items-center py-2 px-4 md:px-6">
				<div className="flex items-center gap-4 md:gap-6">
					<Link
						route="home"
						className="flex-shrink-0 text-2xl text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
						onClick={closeMobileMenu}
					>
						<img
							src="/logo.png"
							alt="MyLinks's logo"
							referrerPolicy="no-referrer"
							className="h-8"
						/>
					</Link>
					<div className="hidden md:flex items-center gap-6">
						{NAVBAR_LINKS.map((link) => (
							<IconLink
								key={link.href}
								href={link.href}
								icon={link.icon}
								external
							>
								{link.label}
							</IconLink>
						))}
					</div>
				</div>
				<div className="hidden md:flex items-center gap-3">
					{auth.isAuthenticated ? (
						<>
							<Link
								route="collection.favorites"
								className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium"
							>
								<i className="i-mdi-view-dashboard h-5 min-w-5 block" />
								Dashboard
							</Link>
							{auth.isAdmin && (
								<Link
									route="admin.dashboard"
									className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium"
								>
									<i className="i-mdi-shield-account h-5 min-w-5 block" />
									Admin
								</Link>
							)}
							<div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
							<AccountMenu side="bottom" />
						</>
					) : (
						<GuestAuthActions />
					)}
				</div>
				<button
					onClick={toggleMobileMenu}
					className="cursor-pointer md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
					aria-label="Toggle menu"
					aria-expanded={isMobileMenuOpen}
				>
					<i
						className={cn(
							isMobileMenuOpen ? 'i-mdi-close' : 'i-mdi-menu',
							'h-6 w-6 block'
						)}
					/>
				</button>
			</div>
			<div
				className={cn(
					'md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg shadow-lg transition-all duration-300 ease-in-out overflow-hidden',
					isMobileMenuOpen
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
								onClick={closeMobileMenu}
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
									onClick={closeMobileMenu}
								>
									<i className="i-mdi-view-dashboard h-5 min-w-5 block" />
									Dashboard
								</Link>
								{auth.isAdmin && (
									<Link
										route="admin.dashboard"
										className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium w-full"
										onClick={closeMobileMenu}
									>
										<i className="i-mdi-shield-account h-5 min-w-5 block" />
										Admin
									</Link>
								)}
								<AccountMenu side="bottom" />
							</>
						) : (
							<MobileGuestAuthActions onNavigate={closeMobileMenu} />
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
