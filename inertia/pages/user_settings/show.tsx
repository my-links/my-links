import { Head } from '@inertiajs/react';
import { t } from '@lingui/core/macro';
import { ApiTokens } from '~/components/api_tokens/api_tokens';
import { DeleteAccount } from '~/components/user_settings/delete_account';
import { ExportImport } from '~/components/user_settings/export_import';

const UserSettingsShow = () => (
	<>
		<Head title={t`Settings`} />
		<div className="space-y-6">
			<ApiTokens />
			<ExportImport />
			<DeleteAccount />
		</div>
	</>
);

export default UserSettingsShow;
