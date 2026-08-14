import { t } from '@lingui/core/macro';
import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button, ConfirmModal } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { formatDate } from '~/lib/format';
import { useAuthMethods } from '~/hooks/use_auth_methods';
import { useAuthProviders } from '~/hooks/use_auth_providers';

const GOOGLE_PROVIDER = 'google';

export function AuthMethods() {
	const { hasPassword, linkedProviders, canUnlinkProvider } = useAuthMethods();
	const { isGoogleEnabled } = useAuthProviders();

	const googleLink = linkedProviders.find(
		(provider) => provider.provider === GOOGLE_PROVIDER
	);
	const isGoogleRowVisible = isGoogleEnabled || googleLink !== undefined;

	const handleUnlinkGoogle = () => {
		void ConfirmModal.call({
			title: <Trans>Unlink Google</Trans>,
			children: (
				<p className="text-sm text-gray-600 dark:text-gray-300">
					<Trans>
						You will no longer be able to sign in with Google on this account.
					</Trans>
				</p>
			),
			confirmLabel: <Trans>Unlink</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			confirmColor: 'danger',
			onConfirm: () =>
				router.delete(
					urlFor('auth.provider.unlink', { provider: GOOGLE_PROVIDER })
				),
		});
	};

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
			<div className="mb-4">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					<Trans>Sign-in methods</Trans>
				</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
					<Trans>
						The ways you can prove who you are. At least one has to remain.
					</Trans>
				</p>
			</div>

			<ul className="divide-y divide-gray-200 dark:divide-gray-700">
				<li className="flex items-center justify-between gap-4 py-3">
					<div className="flex items-center gap-3">
						<i
							className="i-tabler-key h-5 w-5 block text-gray-500 dark:text-gray-400"
							aria-hidden="true"
						/>
						<div>
							<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
								<Trans>Email and password</Trans>
							</p>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{hasPassword ? (
									<Trans>Enabled</Trans>
								) : (
									<Trans>Not set — use the form below to add one</Trans>
								)}
							</p>
						</div>
					</div>
				</li>

				{isGoogleRowVisible && (
					<li className="flex items-center justify-between gap-4 py-3">
						<div className="flex items-center gap-3">
							<i
								className="i-logos-google-icon h-5 w-5 block"
								aria-hidden="true"
							/>
							<div>
								<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
									<Trans>Google</Trans>
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{googleLink?.linkedAt ? (
										<Trans>Linked on {formatDate(googleLink.linkedAt)}</Trans>
									) : (
										<Trans>Not linked</Trans>
									)}
								</p>
							</div>
						</div>

						{googleLink ? (
							<Button
								color="danger"
								size="sm"
								onClick={handleUnlinkGoogle}
								disabled={!canUnlinkProvider}
								title={
									canUnlinkProvider
										? undefined
										: t`Add another sign-in method before removing this one`
								}
							>
								<Trans>Unlink</Trans>
							</Button>
						) : (
							/* A plain anchor, not an Inertia link: this leaves the app for
							   Google, and an XHR navigation cannot do that. */
							<a
								href={urlFor('auth.provider.google.link')}
								className="shrink-0 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
							>
								<Trans>Link</Trans>
							</a>
						)}
					</li>
				)}
			</ul>
		</div>
	);
}
