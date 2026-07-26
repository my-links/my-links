import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

import { useAuthProviders } from '~/hooks/use_auth_providers';

export function HeroAuthActions() {
	const { isGoogleEnabled } = useAuthProviders();

	return (
		<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
			<Link
				route="auth.login"
				className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
			>
				<Trans>Get Started</Trans>
			</Link>
			{isGoogleEnabled && (
				<Link
					route="auth"
					className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-lg"
				>
					<Trans>Continue with Google</Trans>
				</Link>
			)}
		</div>
	);
}
