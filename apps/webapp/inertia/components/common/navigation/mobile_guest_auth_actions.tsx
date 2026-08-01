import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

import { useRegistrationPolicy } from '~/hooks/use_registration_policy';

interface MobileGuestAuthActionsProps {
	onNavigate: () => void;
}

export const MobileGuestAuthActions = ({
	onNavigate,
}: Readonly<MobileGuestAuthActionsProps>) => {
	const { isOpen: isRegistrationOpen } = useRegistrationPolicy();

	return (
		<div className="space-y-2">
			<Link
				route="auth.login"
				className="block px-4 py-2 rounded-lg bg-brand dark:bg-brand-dark text-paper hover:opacity-90 transition-opacity duration-200 font-medium text-center"
				onClick={onNavigate}
			>
				<Trans>Login</Trans>
			</Link>
			{isRegistrationOpen && (
				<Link
					route="auth.register"
					className="block px-4 py-2 rounded-lg border border-rule dark:border-rule-dark text-ink dark:text-ink-dark hover:border-brand dark:hover:border-brand-dark transition-colors duration-200 font-medium text-center"
					onClick={onNavigate}
				>
					<Trans>Register</Trans>
				</Link>
			)}
		</div>
	);
};
