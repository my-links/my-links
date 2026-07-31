import { t } from '@lingui/core/macro';
import { Head } from '@inertiajs/react';

import { ApiTokens } from '~/components/api_tokens/api_tokens';
import { Password } from '~/components/user_settings/password';
import { Sessions } from '~/components/user_settings/sessions';
import { AuthMethods } from '~/components/user_settings/auth_methods';
import { ExportImport } from '~/components/user_settings/export_import';
import { EmailAddress } from '~/components/user_settings/email_address';
import { DeleteAccount } from '~/components/user_settings/delete_account';

const UserSettingsShow = () => (
	<>
		<Head title={t`Settings`} />
		<div className="space-y-6">
			<EmailAddress />
			<AuthMethods />
			<Password />
			<ApiTokens />
			<Sessions />
			<ExportImport />
			<DeleteAccount />
		</div>
	</>
);

export default UserSettingsShow;
