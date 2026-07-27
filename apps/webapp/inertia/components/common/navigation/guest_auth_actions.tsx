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
					className="px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
				>
					<Trans>Register</Trans>
				</Link>
			)}
			<Link
				route="auth.login"
				className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md shadow-blue-500/30"
			>
				<Trans>Login</Trans>
			</Link>
		</div>
	);
};
