import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

import { useAuthProviders } from '~/hooks/use_auth_providers';
import { useRegistrationPolicy } from '~/hooks/use_registration_policy';

const PRIMARY_ACTION_CLASS =
	'px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5';

const SECONDARY_ACTION_CLASS =
	'px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-lg';

const TERTIARY_ACTION_CLASS =
	'px-8 py-4 bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-lg';

/**
 * On an instance that takes new accounts, signing up is the call to action and
 * signing in steps back. On a closed one, signing in is all there is, so it
 * takes the primary styling instead of leaving the hero without an emphasis.
 */
export function HeroAuthActions() {
	const { isGoogleEnabled } = useAuthProviders();
	const { isOpen: isRegistrationOpen } = useRegistrationPolicy();

	return (
		<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
			{isRegistrationOpen && (
				<Link route="auth.register" className={PRIMARY_ACTION_CLASS}>
					<Trans>Get Started</Trans>
				</Link>
			)}
			<Link
				route="auth.login"
				className={
					isRegistrationOpen ? SECONDARY_ACTION_CLASS : PRIMARY_ACTION_CLASS
				}
			>
				<Trans>Sign In</Trans>
			</Link>
			{isGoogleEnabled && (
				<Link route="auth" className={TERTIARY_ACTION_CLASS}>
					<Trans>Continue with Google</Trans>
				</Link>
			)}
		</div>
	);
}
