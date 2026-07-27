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
				className="block px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md shadow-blue-500/30 text-center"
				onClick={onNavigate}
			>
				<Trans>Login</Trans>
			</Link>
			{isRegistrationOpen && (
				<Link
					route="auth.register"
					className="block px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 font-medium text-center"
					onClick={onNavigate}
				>
					<Trans>Register</Trans>
				</Link>
			)}
		</div>
	);
};
