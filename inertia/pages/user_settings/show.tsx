import { useTranslation } from 'react-i18next';
import {
	FloatingTab,
	FloatingTabs,
} from '~/components/common/floating_tabs/floating_tabs';
import { UserPreferences } from '~/components/common/user_preferences/user_preferences';
import SmallContentLayout from '~/layouts/small_content';

function UserSettingsShow() {
	const { t } = useTranslation();
	const tabs: FloatingTab[] = [
		{
			label: t('preferences'),
			value: 'preferences',
			content: <UserPreferences />,
		},
	];
	return <FloatingTabs tabs={tabs} />;
}

UserSettingsShow.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);
export default UserSettingsShow;
