import { AccountMenu } from '~/components/common/navigation/account_menu';

export const SidebarFooter = () => (
	<div className="px-2 py-2 border-t border-gray-200/50 dark:border-gray-700/50">
		<AccountMenu side="top" />
	</div>
);
