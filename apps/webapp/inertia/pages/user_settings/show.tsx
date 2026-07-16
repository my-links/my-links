import { t } from '@lingui/core/macro';
import { Head } from '@inertiajs/react';

import { ApiTokens } from '~/components/api_tokens/api_tokens';
import { Sessions } from '~/components/user_settings/sessions';
import { ExportImport } from '~/components/user_settings/export_import';
import { DeleteAccount } from '~/components/user_settings/delete_account';

const UserSettingsShow = () => (
	<>
		<Head title={t`Settings`} />
		<div className="space-y-6">
			<ApiTokens />
			<Sessions />
			<ExportImport />
			<DeleteAccount />
		</div>
	</>
);

export default UserSettingsShow;
