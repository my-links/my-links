import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Head, useForm } from '@inertiajs/react';
import { Button, Input } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { InertiaProps } from '~/types/inertia';
import SmallContentLayout from '~/layouts/small_content';
import { FormField } from '~/components/common/form_field';

type ResetPasswordFormData = {
	password: string;
	passwordConfirmation: string;
};

type PageProps = InertiaProps<{
	token: string;
	minimumPasswordLength: number;
}>;

function ResetPasswordPage({ token, minimumPasswordLength }: PageProps) {
	const { data, setData, submit, processing, errors } =
		useForm<ResetPasswordFormData>({
			password: '',
			passwordConfirmation: '',
		});

	const isSubmitDisabled =
		processing || !data.password || !data.passwordConfirmation;

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		submit('post', urlFor('auth.password.reset.submit', { token }));
	};

	const handleChangeOf =
		(field: keyof ResetPasswordFormData) =>
		(event: React.ChangeEvent<HTMLInputElement>) =>
			setData(field, event.target.value);

	return (
		<>
			<Head title={t`Choose a new password`} />
			<div className="max-w-md mx-auto bg-paper dark:bg-ink border border-rule dark:border-rule-dark rounded-2xl p-8 shadow-sm">
				<h1 className="font-display text-2xl text-ink dark:text-ink-dark mb-1">
					<Trans>Choose a new password</Trans>
				</h1>
				<p className="text-sm text-ink/60 dark:text-ink-dark/60 mb-6">
					<Trans>
						Everything else signed in on this account will be signed out.
					</Trans>
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<FormField
						label={t`New password`}
						htmlFor="password"
						error={errors.password}
					>
						<Input
							type="password"
							id="password"
							name="password"
							value={data.password}
							onChange={handleChangeOf('password')}
							placeholder={t`At least ${minimumPasswordLength} characters`}
							error={errors.password}
							autoComplete="new-password"
							minLength={minimumPasswordLength}
							autoFocus
							required
						/>
					</FormField>

					<FormField
						label={t`Confirm password`}
						htmlFor="passwordConfirmation"
						error={errors.passwordConfirmation}
					>
						<Input
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
					</FormField>

					<Button
						type="submit"
						disabled={isSubmitDisabled}
						loading={processing}
						fullWidth
					>
						<Trans>Reset my password</Trans>
					</Button>
				</form>
			</div>
		</>
	);
}

ResetPasswordPage.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);

export default ResetPasswordPage;
