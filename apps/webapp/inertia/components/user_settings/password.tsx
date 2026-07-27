import { t } from '@lingui/core/macro';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button, Input } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { FormField } from '~/components/common/form_field';
import { usePasswordSettings } from '~/hooks/use_password_settings';

type PasswordFormData = {
	password: string;
	passwordConfirmation: string;
};

/**
 * One section covering both "add a password" and "replace it". They differ
 * only in what they promise afterwards — a first password revokes nothing,
 * a replacement signs everything else out — so the copy changes and the
 * fields do not.
 */
export function Password() {
	const { hasPassword, minimumPasswordLength } = usePasswordSettings();
	const { data, setData, submit, processing, errors, reset } =
		useForm<PasswordFormData>({
			password: '',
			passwordConfirmation: '',
		});

	const isSubmitDisabled =
		processing || !data.password || !data.passwordConfirmation;

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const onSuccess = () => reset();

		if (hasPassword) {
			submit('put', urlFor('auth.password.change'), { onSuccess });
			return;
		}

		submit('post', urlFor('auth.password.set'), { onSuccess });
	};

	const handleChangeOf =
		(field: keyof PasswordFormData) =>
		(event: React.ChangeEvent<HTMLInputElement>) =>
			setData(field, event.target.value);

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
			<div className="mb-4">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					{hasPassword ? (
						<Trans>Change your password</Trans>
					) : (
						<Trans>Set a password</Trans>
					)}
				</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
					{hasPassword ? (
						<Trans>
							Every other session and every extension token will be signed out.
						</Trans>
					) : (
						<Trans>
							Add an email and password sign-in to this account, alongside the
							methods it already has.
						</Trans>
					)}
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4 max-w-md">
				<FormField
					label={t`New password`}
					htmlFor="newPassword"
					error={errors.password}
				>
					<Input
						type="password"
						id="newPassword"
						name="password"
						value={data.password}
						onChange={handleChangeOf('password')}
						placeholder={t`At least ${minimumPasswordLength} characters`}
						error={errors.password}
						autoComplete="new-password"
						minLength={minimumPasswordLength}
						required
					/>
				</FormField>

				<FormField
					label={t`Confirm password`}
					htmlFor="newPasswordConfirmation"
					error={errors.passwordConfirmation}
				>
					<Input
						type="password"
						id="newPasswordConfirmation"
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
					size="sm"
					disabled={isSubmitDisabled}
					loading={processing}
				>
					{hasPassword ? (
						<Trans>Change my password</Trans>
					) : (
						<Trans>Set my password</Trans>
					)}
				</Button>
			</form>
		</div>
	);
}
