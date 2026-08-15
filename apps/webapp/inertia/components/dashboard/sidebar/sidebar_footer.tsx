import { useSidebarMode } from '~/hooks/use_sidebar_mode';
import { AccountMenu } from '~/components/common/navigation/account_menu';

// `flex flex-col` stretches the span `Menu` wraps its trigger in, which is what the trigger's own `w-full` resolves against.
export function SidebarFooter() {
	const isRail = useSidebarMode() === 'rail';

	return (
		<div className="flex flex-col px-2 py-2 border-t border-gray-200/50 dark:border-gray-700/50">
			<AccountMenu side="top" iconOnly={isRail} />
		</div>
	);
}
