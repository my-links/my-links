import { Head } from '@inertiajs/react';
import { t } from '@lingui/core/macro';
import { ApiTokens } from '~/components/api_tokens/api_tokens';

const UserSettingsShow = () => (
	<>
		<Head title={t`Settings`} />
		<ApiTokens />
	</>
);

export default UserSettingsShow;
