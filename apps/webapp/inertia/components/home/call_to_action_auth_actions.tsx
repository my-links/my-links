import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

import { useAuthProviders } from '~/hooks/use_auth_providers';
import { useRegistrationPolicy } from '~/hooks/use_registration_policy';

const PRIMARY_ACTION_CLASS =
	'px-8 py-4 bg-brand dark:bg-brand-dark text-paper font-semibold rounded-xl hover:opacity-90 transition-opacity duration-200';

const SECONDARY_ACTION_CLASS =
	'px-8 py-4 bg-transparent text-ink dark:text-ink-dark font-semibold rounded-xl border border-rule dark:border-rule-dark hover:border-brand dark:hover:border-brand-dark transition-colors duration-200';

export function CallToActionAuthActions() {
	const { isGoogleEnabled } = useAuthProviders();
	const { isOpen: isRegistrationOpen } = useRegistrationPolicy();

	return (
		<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
			{isRegistrationOpen && (
				<Link route="auth.register" className={PRIMARY_ACTION_CLASS}>
					<Trans>Start for free</Trans>
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
				<Link route="auth" className={SECONDARY_ACTION_CLASS}>
					<Trans>Continue with Google</Trans>
				</Link>
			)}
		</div>
	);
}
