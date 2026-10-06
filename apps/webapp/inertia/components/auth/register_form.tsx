import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Button, Input } from '@minimalstuff/ui';

import { useRegisterForm } from '~/hooks/use_register_form';

type RegisterFormProps = {
	minimumPasswordLength: number;
};

export function RegisterForm({
	minimumPasswordLength,
}: Readonly<RegisterFormProps>) {
	const {
		data,
		errors,
		processing,
		isSubmitDisabled,
		handleSubmit,
		handleChangeOf,
	} = useRegisterForm();

	return (
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
	);
}
