import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';
import { Head, useForm } from '@inertiajs/react';
import { Button, Input } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { InertiaProps } from '~/lib/inertia_props';
import SmallContentLayout from '~/layouts/small_content';
import { useAuthProviders } from '~/hooks/use_auth_providers';
import { GoogleSignInAction } from '~/components/auth/google_sign_in_action';

type RegisterFormData = {
	name: string;
	email: string;
	password: string;
	passwordConfirmation: string;
};

/**
 * The minimum comes from the server, so the hint under the field and the rule
 * that rejects the form can never drift apart.
 */
type PageProps = InertiaProps<{
	minimumPasswordLength: number;
}>;

function RegisterPage({ minimumPasswordLength }: PageProps) {
	const { isGoogleEnabled } = useAuthProviders();
	const { data, setData, submit, processing, errors } =
		useForm<RegisterFormData>({
			name: '',
			email: '',
			password: '',
			passwordConfirmation: '',
		});

	const isSubmitDisabled =
		processing ||
		!data.name ||
		!data.email ||
		!data.password ||
		!data.passwordConfirmation;

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		submit('post', urlFor('auth.register.submit'));
	};

	const handleChangeOf =
		(field: keyof RegisterFormData) =>
		(event: React.ChangeEvent<HTMLInputElement>) =>
			setData(field, event.target.value);

	return (
		<>
			<Head title={t`Register`} />
			<div className="max-w-md mx-auto bg-paper dark:bg-ink border border-rule dark:border-rule-dark rounded-2xl p-8 shadow-sm">
				<h1 className="font-display text-2xl text-ink dark:text-ink-dark mb-1">
					<Trans>Create your account</Trans>
				</h1>
				<p className="text-sm text-ink/60 dark:text-ink-dark/60 mb-6">
					<Trans>Start collecting your links in one place</Trans>
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<Input
						label={t`Name`}
						type="text"
						id="name"
						name="name"
						value={data.name}
						onChange={handleChangeOf('name')}
						placeholder={t`Ada Lovelace`}
						error={errors.name}
						autoComplete="name"
						autoFocus
						required
					/>

					<Input
						label={t`Email`}
						type="email"
						id="email"
						name="email"
						value={data.email}
						onChange={handleChangeOf('email')}
						placeholder={t`you@example.com`}
						error={errors.email}
						autoComplete="email"
						required
					/>

					<Input
						label={t`Password`}
						type="password"
						id="password"
						name="password"
						value={data.password}
						onChange={handleChangeOf('password')}
						placeholder={t`At least ${minimumPasswordLength} characters`}
						error={errors.password}
						autoComplete="new-password"
						minLength={minimumPasswordLength}
						required
					/>

					<Input
						label={t`Confirm password`}
						type="password"
						id="passwordConfirmation"
						name="passwordConfirmation"
						value={data.passwordConfirmation}
						onChange={handleChangeOf('passwordConfirmation')}
						placeholder={t`Type it once more`}
						error={errors.passwordConfirmation}
						autoComplete="new-password"
						required
					/>

					<Button
						type="submit"
						disabled={isSubmitDisabled}
						loading={processing}
						fullWidth
					>
						<Trans>Create my account</Trans>
					</Button>
				</form>

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

RegisterPage.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);

export default RegisterPage;
