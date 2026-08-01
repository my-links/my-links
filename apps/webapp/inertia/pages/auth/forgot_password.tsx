import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';
import { Head, useForm } from '@inertiajs/react';
import { Button, Input } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import SmallContentLayout from '~/layouts/small_content';
import { FormField } from '~/components/common/form_field';

type ForgotPasswordFormData = {
	email: string;
};

function ForgotPasswordPage() {
	const { data, setData, submit, processing, errors } =
		useForm<ForgotPasswordFormData>({ email: '' });

	const isSubmitDisabled = processing || !data.email;

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		submit('post', urlFor('auth.password.forgot.submit'));
	};

	const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		setData('email', event.target.value);

	return (
		<>
			<Head title={t`Reset your password`} />
			<div className="max-w-md mx-auto bg-paper dark:bg-ink border border-rule dark:border-rule-dark rounded-2xl p-8 shadow-sm">
				<h1 className="font-display text-2xl text-ink dark:text-ink-dark mb-1">
					<Trans>Reset your password</Trans>
				</h1>
				<p className="text-sm text-ink/60 dark:text-ink-dark/60 mb-6">
					<Trans>
						Give us the address on your account and we will send a link to
						choose a new password.
					</Trans>
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<FormField label={t`Email`} htmlFor="email" error={errors.email}>
						<Input
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
					</FormField>

					<Button
						type="submit"
						disabled={isSubmitDisabled}
						loading={processing}
						fullWidth
					>
						<Trans>Send the link</Trans>
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-ink/60 dark:text-ink-dark/60">
					<Trans>
						Remembered it?{' '}
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

ForgotPasswordPage.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);

export default ForgotPasswordPage;
