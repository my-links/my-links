import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';
import { Head, useForm } from '@inertiajs/react';
import { Button, Input } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { InertiaProps } from '~/lib/inertia_props';
import SmallContentLayout from '~/layouts/small_content';
import { useAuthProviders } from '~/hooks/use_auth_providers';
import { usePasswordRecovery } from '~/hooks/use_password_recovery';
import { useRegistrationPolicy } from '~/hooks/use_registration_policy';
import { GoogleSignInAction } from '~/components/auth/google_sign_in_action';
import { ResendVerificationAction } from '~/components/auth/resend_verification_action';

type LoginFormData = {
	email: string;
	password: string;
};

/**
 * Set only on the render that follows a sign-in refused for an unconfirmed
 * address, and it carries that address so the resend action needs no typing.
 */
type PageProps = InertiaProps<{
	unconfirmedEmail: string | null;
}>;

function LoginPage({ unconfirmedEmail }: PageProps) {
	const { isGoogleEnabled } = useAuthProviders();
	const { isOpen: isRegistrationOpen } = useRegistrationPolicy();
	const { isEnabled: isPasswordRecoveryEnabled } = usePasswordRecovery();
	const { data, setData, submit, processing, errors } = useForm<LoginFormData>({
		email: '',
		password: '',
	});

	const isSubmitDisabled = processing || !data.email || !data.password;

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		submit('post', urlFor('auth.login.submit'));
	};

	const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		setData('email', event.target.value);

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		setData('password', event.target.value);

	return (
		<>
			<Head title={t`Login`} />
			<div className="max-w-md mx-auto bg-paper dark:bg-ink border border-rule dark:border-rule-dark rounded-2xl p-8 shadow-sm">
				<h1 className="font-display text-2xl text-ink dark:text-ink-dark mb-1">
					<Trans>Welcome back</Trans>
				</h1>
				<p className="text-sm text-ink/60 dark:text-ink-dark/60 mb-6">
					<Trans>Sign in to reach your collections</Trans>
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<Input
						label={t`Email`}
						type="email"
						id="email"
						name="email"
						value={data.email}
						onChange={handleEmailChange}
						placeholder={t`you@example.com`}
						error={errors.email}
						autoComplete="email"
						autoFocus
						required
					/>

					<Input
						label={t`Password`}
						type="password"
						id="password"
						name="password"
						value={data.password}
						onChange={handlePasswordChange}
						placeholder={t`Your password`}
						error={errors.password}
						autoComplete="current-password"
						required
					/>

					<Button
						type="submit"
						disabled={isSubmitDisabled}
						loading={processing}
						fullWidth
					>
						<Trans>Login</Trans>
					</Button>
				</form>

				{unconfirmedEmail && (
					<ResendVerificationAction email={unconfirmedEmail} />
				)}

				{/* Only offered where a link can actually be sent: an instance
				    with no outgoing mail has no reset route to point at. */}
				{isPasswordRecoveryEnabled && (
					<p className="mt-4 text-center text-sm">
						<Link
							route="auth.password.forgot"
							className="font-medium text-brand dark:text-brand-dark hover:underline"
						>
							<Trans>Forgot your password?</Trans>
						</Link>
					</p>
				)}

				{isGoogleEnabled && (
					<div className="mt-6 space-y-4">
						<GoogleSignInAction />
					</div>
				)}

				{isRegistrationOpen && (
					<p className="mt-6 text-center text-sm text-ink/60 dark:text-ink-dark/60">
						<Trans>
							No account yet?{' '}
							<Link
								route="auth.register"
								className="font-medium text-brand dark:text-brand-dark hover:underline"
							>
								Create one
							</Link>
						</Trans>
					</p>
				)}
			</div>
		</>
	);
}

LoginPage.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);

export default LoginPage;
