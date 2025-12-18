import {
	PROJECT_EXTENSION_URL,
	PROJECT_REPO_GITHUB_URL,
} from '#config/project';
import { UserAuth } from '#shared/types/dto';
import { Link } from '@inertiajs/react';
import { withAuth } from '~/hooks/use_auth';

const LINKS = [
	{
		label: 'Github',
		href: PROJECT_REPO_GITHUB_URL,
		icon: 'i-mdi-github',
	},
	{
		label: 'Extension',
		href: PROJECT_EXTENSION_URL,
		icon: 'i-mdi-extension',
	},
] as const;

const NavbarLink = ({ link }: { link: (typeof LINKS)[number] }) => (
	<a
		href={link.href}
		target="_blank"
		rel="noopener noreferrer"
		className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
		key={link.href}
	>
		<i className={`${link.icon} h-5 min-w-5 block`} />
		<span className="font-medium">{link.label}</span>
	</a>
);

export const Navbar = withAuth(({ auth }: { auth: UserAuth }) => (
	<nav className="h-[64px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 max-w-[1920px] flex justify-between items-center py-2 px-6 rounded-lg shadow-sm">
		<div className="flex items-center gap-6">
			<Link
				href="/"
				className="flex-shrink-0 text-2xl text-gray-900 dark:text-white mr-6 hover:opacity-80 transition-opacity"
			>
				<img
					src="/logo.png"
					alt="MyLinks's logo"
					referrerPolicy="no-referrer"
					className="h-8"
				/>
			</Link>
			<>
				{LINKS.map((link) => (
					<NavbarLink key={link.href} link={link} />
				))}
			</>
		</div>
		<div className="flex items-center gap-3">
			{auth.isAuthenticated ? (
				<>
					<Link
						href="/dashboard"
						className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium"
					>
						<i className="i-mdi-view-dashboard h-5 min-w-5 block" />
						Dashboard
					</Link>
					<div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
					<div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
						<span className="text-sm text-gray-600 dark:text-gray-400">
							Bonjour,
						</span>
						<span className="text-sm font-medium text-gray-900 dark:text-white">
							{auth.user?.fullname}
						</span>
						<Link
							href="/auth/logout"
							className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
							title="Déconnexion"
						>
							<i className="i-mdi-logout text-red-600 dark:text-red-400 h-5 min-w-5 block" />
						</Link>
					</div>
				</>
			) : (
				<>
					<a
						href="/auth/google"
						className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium"
					>
						Login
					</a>
					<Link
						href="/auth/register"
						className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md shadow-blue-500/30"
					>
						Register
					</Link>
				</>
			)}
		</div>
	</nav>
));
