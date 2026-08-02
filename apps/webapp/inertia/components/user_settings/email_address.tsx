import { t } from '@lingui/core/macro';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button, Input } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { useEmailSettings } from '~/hooks/use_email_settings';

type EmailChangeFormData = {
	email: string;
};

export function EmailAddress() {
	const { emailAddress, canChangeEmail } = useEmailSettings();
	const { data, setData, post, processing, errors, reset } =
		useForm<EmailChangeFormData>({ email: '' });

	const isSubmitDisabled = processing || !data.email;

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		post(urlFor('auth.email.change'), { onSuccess: () => reset() });
	};

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
			<div className="mb-4">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					<Trans>Email address</Trans>
				</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
					<Trans>
						The address you sign in with, and the one recovery links are sent
						to.
					</Trans>
				</p>
			</div>

			<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
				{emailAddress}
			</p>

			{canChangeEmail ? (
				<form onSubmit={handleSubmit} className="space-y-4 max-w-md mt-4">
					<Input
						label={t`New email address`}
						type="email"
						id="newEmailAddress"
						name="email"
						value={data.email}
						onChange={(event) => setData('email', event.target.value)}
						placeholder={t`you@example.com`}
						error={errors.email}
						autoComplete="email"
						required
					/>

					<p className="text-sm text-gray-500 dark:text-gray-400">
						<Trans>
							The new address has to confirm the change, and the current one is
							told about it so you can cancel.
						</Trans>
					</p>

					<Button
						type="submit"
						size="sm"
						disabled={isSubmitDisabled}
						loading={processing}
					>
						<Trans>Change my email address</Trans>
					</Button>
				</form>
			) : (
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
					<Trans>
						This instance sends no email, so the address cannot be changed from
						here.
					</Trans>
				</p>
			)}
		</div>
	);
}
