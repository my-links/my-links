import { Trans } from '@lingui/react/macro';
import { IconButton, Modal } from '@minimalstuff/ui';

import {
	QuickActionsContent,
	type QuickActionsContentProps,
} from '~/components/dashboard/headers/quick_actions_content';

type DashboardQuickActionProps = Omit<QuickActionsContentProps, 'onClose'>;

export function DashboardQuickAction(
	props: Readonly<DashboardQuickActionProps>
) {
	const handleOpen = () => {
		const handleClose = () => Modal.end(call, undefined);
		const call = Modal.call({
			title: <Trans>Quick Actions</Trans>,
			size: 'sm',
			className: 'flex flex-col gap-4',
			children: <QuickActionsContent {...props} onClose={handleClose} />,
		});
	};

	return (
		<IconButton
			icon="i-ant-design-thunderbolt-outlined"
			onClick={handleOpen}
			aria-label="Quick actions"
			variant="ghost"
			className="flex-shrink-0 border border-gray-300/50 dark:border-gray-600/50"
		/>
	);
}
