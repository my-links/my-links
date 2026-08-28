import { t } from '@lingui/core/macro';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button, Input } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { useRenameAccountSettings } from '~/hooks/use_rename_account_settings';

type RenameAccountFormData = {
	nickName: string;
};

export function DisplayName() {
	const { displayName } = useRenameAccountSettings();
	const { data, setData, put, processing, errors } =
		useForm<RenameAccountFormData>({ nickName: displayName });

	const isSubmitDisabled = processing || !data.nickName;

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		put(urlFor('user.settings.rename'));
	};

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
			<div className="mb-4">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					<Trans>Display name</Trans>
				</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
					<Trans>The name shown for your account throughout MyLinks.</Trans>
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4 max-w-md">
				<Input
					label={t`Display name`}
					id="nickName"
					name="nickName"
					value={data.nickName}
					onChange={(event) => setData('nickName', event.target.value)}
					placeholder={t`Your name`}
					error={errors.nickName}
					autoComplete="nickname"
					required
				/>

				<Button
					type="submit"
					size="sm"
					disabled={isSubmitDisabled}
					loading={processing}
				>
					<Trans>Save name</Trans>
				</Button>
			</form>
		</div>
	);
}
