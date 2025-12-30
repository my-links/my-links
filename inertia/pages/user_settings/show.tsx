import { t } from '@lingui/core/macro';
import { ApiTokens } from '~/components/api_tokens/api_tokens';
import {
	FloatingTab,
	FloatingTabs,
} from '~/components/common/floating_tabs/floating_tabs';
import SmallContentLayout from '~/layouts/small_content';

function UserSettingsShow() {
	const tabs: FloatingTab[] = [
		{
			label: t`API Tokens`,
			value: 'api-tokens',
			content: <ApiTokens />,
		},
	];
	return <FloatingTabs tabs={tabs} />;
}

UserSettingsShow.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);
export default UserSettingsShow;
