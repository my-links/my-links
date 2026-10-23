import { Head } from '@inertiajs/react';
import { t } from '@lingui/core/macro';

import { ApiTokens } from '~/components/api_tokens/api_tokens';
import { AppPageHeader } from '~/components/common/navigation/app_page_header';
import { About } from '~/components/user_settings/about';
import { AuthMethods } from '~/components/user_settings/auth_methods';
import { DeleteAccount } from '~/components/user_settings/delete_account';
import { DisplayName } from '~/components/user_settings/display_name';
import { EmailAddress } from '~/components/user_settings/email_address';
import { ExportImport } from '~/components/user_settings/export_import';
import { Password } from '~/components/user_settings/password';
import { Preferences } from '~/components/user_settings/preferences';
import { Sessions } from '~/components/user_settings/sessions';
import { AppLayout } from '~/layouts/app_layout';

const UserSettingsShow = () => (
	<div className="w-full md:h-full p-4">
		<Head title={t`Settings`} />
		<div className="space-y-6">
			<Preferences />
			<DisplayName />
			<EmailAddress />
			<AuthMethods />
			<Password />
			<ApiTokens />
			<Sessions />
			<ExportImport />
			<DeleteAccount />
			<About />
		</div>
	</div>
);

UserSettingsShow.layout = (page: React.ReactNode) => (
	<AppLayout>
		<AppPageHeader title={t`Settings`} />
		{page}
	</AppLayout>
);

export default UserSettingsShow;
