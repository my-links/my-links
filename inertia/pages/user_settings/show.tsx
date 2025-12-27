import { Trans as TransComponent } from '@lingui/react';
import { ApiTokens } from '~/components/common/api_tokens/api_tokens';
import {
	FloatingTab,
	FloatingTabs,
} from '~/components/common/floating_tabs/floating_tabs';
import SmallContentLayout from '~/layouts/small_content';

function UserSettingsShow() {
	const tabs: FloatingTab[] = [
		{
			label: <TransComponent id="api-tokens.title" message="API Tokens" />,
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
