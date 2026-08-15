import { t } from '@lingui/core/macro';
import { Head } from '@inertiajs/react';

import { AppLayout } from '~/layouts/app_layout';
import { About } from '~/components/user_settings/about';
import { ApiTokens } from '~/components/api_tokens/api_tokens';
import { Password } from '~/components/user_settings/password';
import { Sessions } from '~/components/user_settings/sessions';
import { Preferences } from '~/components/user_settings/preferences';
import { AuthMethods } from '~/components/user_settings/auth_methods';
import { ExportImport } from '~/components/user_settings/export_import';
import { EmailAddress } from '~/components/user_settings/email_address';
import { DeleteAccount } from '~/components/user_settings/delete_account';
import { AppPageHeader } from '~/components/common/navigation/app_page_header';

const UserSettingsShow = () => (
	<>
		<Head title={t`Settings`} />
		<div className="space-y-6">
			<Preferences />
			<EmailAddress />
			<AuthMethods />
			<Password />
			<ApiTokens />
			<Sessions />
			<ExportImport />
			<DeleteAccount />
			<About />
		</div>
	</>
);

UserSettingsShow.layout = (page: React.ReactNode) => (
	<AppLayout>
		<AppPageHeader title={t`Settings`} />
		{page}
	</AppLayout>
);

export default UserSettingsShow;
