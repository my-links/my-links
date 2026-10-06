import { t } from '@lingui/core/macro';
import { Head } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

import { InertiaProps } from '~/lib/inertia_props';
import { useAuthProviders } from '~/hooks/use_auth_providers';
import { RegisterForm } from '~/components/auth/register_form';
import { GoogleSignInAction } from '~/components/auth/google_sign_in_action';

/**
 * The minimum comes from the server, so the hint under the field and the rule
 * that rejects the form can never drift apart.
 */
type PageProps = InertiaProps<{
	minimumPasswordLength: number;
}>;

function RegisterPage({ minimumPasswordLength }: Readonly<PageProps>) {
	const { isGoogleEnabled } = useAuthProviders();

	return (
		<>
			<Head title={t`Register`} />
			<div className="max-w-md w-full mx-auto my-auto bg-paper dark:bg-ink border border-rule dark:border-rule-dark rounded-2xl p-8 shadow-sm">
				<h1 className="font-display text-2xl text-ink dark:text-ink-dark mb-1">
					<Trans>Create your account</Trans>
				</h1>
				<p className="text-sm text-ink/60 dark:text-ink-dark/60 mb-6">
					<Trans>Start collecting your links in one place</Trans>
				</p>

				<RegisterForm minimumPasswordLength={minimumPasswordLength} />

				{isGoogleEnabled && (
					<div className="mt-6 space-y-4">
						<GoogleSignInAction />
					</div>
				)}

				<p className="mt-6 text-center text-sm text-ink/60 dark:text-ink-dark/60">
					<Trans>
						Already have an account?{' '}
						<Link
							route="auth.login"
							className="font-medium text-brand dark:text-brand-dark hover:underline"
						>
							Sign in
						</Link>
					</Trans>
				</p>
			</div>
		</>
	);
}

export default RegisterPage;
