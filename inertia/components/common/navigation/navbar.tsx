import { Link } from '@adonisjs/inertia/react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { ThemeToggle } from '@minimalstuff/ui';
import { useEffect, useState } from 'react';
import { LocaleSwitcher } from '~/components/common/locale_switcher';
import { FOOTER_LINKS } from '~/components/common/navigation/footer_links';
import { IconLink } from '~/components/common/navigation/icon_link';
import { MadeBy } from '~/components/common/navigation/made_by';
import { NAVBAR_LINKS } from '~/components/common/navigation/navbar_links';
import { MOBILE_BREAKPOINT } from '~/consts/breakpoints';
import { useAuth } from '~/hooks/use_auth';

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
		<nav className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 max-w-[1920px] rounded-lg shadow-sm">
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
							<div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									<Trans>Hello</Trans>,
								</span>
								<span className="text-sm font-medium text-gray-900 dark:text-white">
									{auth.user?.fullname}
								</span>
								<Link
									route="user.settings"
									className="p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors"
									title={t`Settings`}
									onClick={closeMobileMenu}
								>
									<i className="i-mdi-cog text-gray-600 dark:text-gray-400 h-5 min-w-5 block" />
								</Link>
								<Link
									route="auth.logout"
									className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
									title={t`Logout`}
								>
									<i className="i-mdi-logout text-red-600 dark:text-red-400 h-5 min-w-5 block" />
								</Link>
							</div>
						</>
					) : (
						<>
							<Link
								route="auth"
								className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium"
							>
								Login
							</Link>
							<Link
								route="auth"
								className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md shadow-blue-500/30"
							>
								Register
							</Link>
						</>
					)}
				</div>
				<button
					onClick={toggleMobileMenu}
					className="cursor-pointer md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
					aria-label="Toggle menu"
					aria-expanded={isMobileMenuOpen}
				>
					<i
						className={`${
							isMobileMenuOpen ? 'i-mdi-close' : 'i-mdi-menu'
						} h-6 w-6 block`}
					/>
				</button>
			</div>
			<div
				className={`md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
					isMobileMenuOpen
						? 'opacity-100 translate-y-0 max-h-screen'
						: 'opacity-0 -translate-y-4 max-h-0 pointer-events-none'
				}`}
			>
				<div className="py-4 px-4 min-h-[calc(100vh-122px)] flex flex-col">
					<div className="space-y-4">
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
									<div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
										<span className="text-sm text-gray-600 dark:text-gray-400">
											Bonjour,
										</span>
										<span className="text-sm font-medium text-gray-900 dark:text-white flex-1 truncate">
											{auth.user?.fullname}
										</span>
										<Link
											route="user.settings"
											className="p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors"
											title={t`Settings`}
											onClick={closeMobileMenu}
										>
											<i className="i-mdi-cog text-gray-600 dark:text-gray-400 h-5 min-w-5 block" />
										</Link>
										<Link
											route="auth.logout"
											className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
											title={t`Logout`}
											onClick={closeMobileMenu}
										>
											<i className="i-mdi-logout text-red-600 dark:text-red-400 h-5 min-w-5 block" />
										</Link>
									</div>
								</>
							) : (
								<>
									<Link
										route="auth"
										className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium text-center"
										onClick={closeMobileMenu}
									>
										Login
									</Link>
									<Link
										route="auth"
										className="block px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md shadow-blue-500/30 text-center"
										onClick={closeMobileMenu}
									>
										Register
									</Link>
								</>
							)}
						</div>
						<div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
							{FOOTER_LINKS.map((link) => (
								<IconLink
									key={link.href}
									href={link.href}
									icon={link.icon}
									external={!link.internal}
									onClick={closeMobileMenu}
									fullWidth
								>
									{link.label}
								</IconLink>
							))}
						</div>
						<div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
							<MadeBy
								onClick={closeMobileMenu}
								className="text-sm text-gray-600 dark:text-gray-400"
							/>
							<div className="flex items-center gap-2">
								<LocaleSwitcher />
								<ThemeToggle />
							</div>
						</div>
					</div>
					<div className="flex-1 flex items-center justify-center">
						<img
							src="/logo.png"
							alt="MyLinks's logo"
							referrerPolicy="no-referrer"
							className="w-full opacity-5 grayscale"
						/>
					</div>
				</div>
			</div>
		</nav>
	);
}
