import { AUTHOR_GITHUB_URL, AUTHOR_NAME } from '#config/project';
import { Link } from '@inertiajs/react';

export const Footer = () => (
	<footer className="bg-white dark:bg-gray-800 max-w-[1920px] flex items-center justify-center gap-4 py-4 px-6 rounded-md">
		<div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm w-full justify-between">
			<div className="flex items-center gap-2">
				<span>
					Créé par{' '}
					<a
						href={AUTHOR_GITHUB_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="text-inherit underline underline-offset-4 hover:text-blue-500 transition-colors"
					>
						{AUTHOR_NAME}
					</a>
				</span>
				<span className="mx-2 select-none">•</span>
				<Link
					href="/status"
					className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
				>
					<i className="i-mdi-heart-pulse h-6 min-w-6 block" />
					Statut
				</Link>
				<a
					href="/jobs-queue"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
				>
					<i className="i-mdi-view-dashboard h-6 min-w-6 block" />
					Job queue
				</a>
			</div>
			<div className="flex items-center gap-3">
				{/* Ici tu pourrais rajouter ThemeSwitcher et LocaleSwitcher si tu veux */}
				<a
					href="https://github.com/izzysoft/recond"
					target="_blank"
					rel="noopener noreferrer"
					className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
				>
					v1.0.0
				</a>
				<Link href="/privacy" className="hover:text-blue-500 transition-colors">
					Privacy
				</Link>
				<Link href="/terms" className="hover:text-blue-500 transition-colors">
					Terms
				</Link>
			</div>
		</div>
	</footer>
);
