import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

import { useRegistrationPolicy } from '~/hooks/use_registration_policy';

export const GuestAuthActions = () => {
	const { isOpen: isRegistrationOpen } = useRegistrationPolicy();

	return (
		<div className="flex items-center gap-3">
			{isRegistrationOpen && (
				<Link
					route="auth.register"
					className="px-2 py-2 text-ink dark:text-ink-dark hover:text-brand dark:hover:text-brand-dark transition-colors duration-200 font-medium"
				>
					<Trans>Register</Trans>
				</Link>
			)}
			<Link
				route="auth.login"
				className="px-4 py-2 rounded-lg bg-brand dark:bg-brand-dark text-paper hover:opacity-90 transition-opacity duration-200 font-medium"
			>
				<Trans>Login</Trans>
			</Link>
		</div>
	);
};
