import {
	PROJECT_EXTENSION_URL,
	PROJECT_REPO_GITHUB_URL,
} from '#config/project';
import { UserAuth } from '#shared/types/dto';
import { Link } from '@inertiajs/react';
import { LocaleSwitcher } from '~/components/common/locale_switcher';
import { ThemeToggle } from '~/components/common/theme_toggle';
import { withAuth } from '~/hooks/use_auth';

const LINKS = [
	{
		label: 'Dashboard',
		href: '/dashboard',
		icon: 'i-mdi-view-dashboard',
		external: false,
	},
	{
		label: 'Github',
		href: PROJECT_REPO_GITHUB_URL,
		icon: 'i-mdi-github',
		external: true,
	},
	{
		label: 'Extension',
		href: PROJECT_EXTENSION_URL,
		icon: 'i-mdi-extension',
		external: true,
	},
] as const;

const NavbarLink = ({ link }: { link: (typeof LINKS)[number] }) => {
	const Icon = (
		<i
			className={`${link.icon} text-gray-500 dark:text-gray-400 h-6 min-w-6 block`}
		/>
	);

	if (link.external) {
		return (
			<a
				href={link.href}
				target="_blank"
				rel="noopener noreferrer"
				className="text-gray-900 dark:text-white flex items-center gap-2"
				key={link.href}
			>
				{Icon}
				{link.label}
			</a>
		);
	}

	return (
		<Link
			href={link.href}
			className="text-gray-900 dark:text-white flex items-center gap-2"
			key={link.href}
		>
			{Icon}
			{link.label}
		</Link>
	);
};

export const Navbar = withAuth(({ auth }: { auth: UserAuth }) => (
	<nav className="h-[64px] bg-white dark:bg-gray-800 max-w-[1920px] flex justify-between items-center py-2 px-6 rounded-md">
		<div className="flex items-center gap-6">
			<Link
				href="/"
				className="flex-shrink-0 text-2xl text-gray-900 dark:text-white mr-6"
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
		<div className="flex items-center gap-4">
			{auth.isAuthenticated ? (
				<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
					Bonjour,
					<span className="text-gray-900 dark:text-white">
						{auth.user?.fullname}
					</span>
					<Link href="/auth/logout">
						<i className="i-mdi-logout text-red-600 dark:text-red-400 h-4 min-w-4 block cursor-pointer" />
					</Link>
				</div>
			) : (
				<>
					<Link
						href="/auth/login"
						className="text-gray-900 dark:text-white flex items-center gap-2"
					>
						Login
					</Link>
					<Link
						href="/auth/register"
						className="text-gray-900 dark:text-white flex items-center gap-2"
					>
						Register
					</Link>
				</>
			)}
			<LocaleSwitcher />
			<ThemeToggle />
		</div>
	</nav>
));
