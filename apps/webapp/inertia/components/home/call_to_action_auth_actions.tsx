import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

import { useAuthProviders } from '~/hooks/use_auth_providers';

export function CallToActionAuthActions() {
	const { isGoogleEnabled } = useAuthProviders();

	return (
		<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
			<Link
				route="auth.login"
				className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
			>
				<Trans>Sign In</Trans>
			</Link>
			{isGoogleEnabled && (
				<Link
					route="auth"
					className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
				>
					<Trans>Continue with Google</Trans>
				</Link>
			)}
		</div>
	);
}
