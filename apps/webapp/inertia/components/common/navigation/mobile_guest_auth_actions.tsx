import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

interface MobileGuestAuthActionsProps {
	onNavigate: () => void;
}

export const MobileGuestAuthActions = ({
	onNavigate,
}: Readonly<MobileGuestAuthActionsProps>) => (
	<>
		<Link
			route="auth"
			className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium text-center"
			onClick={onNavigate}
		>
			<Trans>Login</Trans>
		</Link>
		<Link
			route="auth"
			className="block px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md shadow-blue-500/30 text-center"
			onClick={onNavigate}
		>
			<Trans>Register</Trans>
		</Link>
	</>
);
