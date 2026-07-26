import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

export const GoogleSignInAction = () => (
	<>
		<div className="flex items-center gap-3">
			<span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
			<span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
				<Trans>or</Trans>
			</span>
			<span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
		</div>
		<Link
			route="auth"
			className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
		>
			<i className="i-logos-google-icon h-5 w-5 block" aria-hidden="true" />
			<Trans>Continue with Google</Trans>
		</Link>
	</>
);
