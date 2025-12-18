import { AUTHOR_GITHUB_URL, AUTHOR_NAME } from '#config/project';
import PATHS from '#constants/paths';
import { Link } from '@inertiajs/react';
import { LocaleSwitcher } from '~/components/common/locale_switcher';
import { ThemeToggle } from '~/components/common/theme_toggle';

export const Footer = () => (
	<footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 max-w-[1920px] flex items-center justify-center gap-4 py-4 px-6 rounded-lg shadow-sm">
		<div className="flex flex-col sm:flex-row items-center gap-4 text-gray-600 dark:text-gray-400 text-sm w-full justify-between">
			<div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
				<span className="flex items-center gap-2">
					Créé par{' '}
					<a
						href={AUTHOR_GITHUB_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
					>
						{AUTHOR_NAME}
					</a>
				</span>
				<Link
					href="/status"
					className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
				>
					<i className="i-mdi-heart-pulse h-5 min-w-5 block" />
					<span className="font-medium">Statut</span>
				</Link>
			</div>
			<div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
				<a
					href={PATHS.REPO_GITHUB}
					target="_blank"
					rel="noopener noreferrer"
					className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium"
				>
					v1.0.0
				</a>
				<Link
					href="/privacy"
					className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium"
				>
					Privacy
				</Link>
				<Link
					href="/terms"
					className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium"
				>
					Terms
				</Link>
				<div className="flex items-center gap-2">
					<LocaleSwitcher />
					<ThemeToggle />
				</div>
			</div>
		</div>
	</footer>
);
