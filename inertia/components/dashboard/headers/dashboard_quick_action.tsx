import { KEYS } from '#constants/keys';
import { Visibility } from '#enums/collections/visibility';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { Button } from '~/components/common/button';
import { IconButton } from '~/components/common/icon_button';
import { Kbd } from '~/components/common/kbd';
import { Modal } from '~/components/common/modal';
import { DashboardHeaderProps } from '~/components/dashboard/headers/dashboard_header';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { useIsMobile } from '~/hooks/use_is_mobile';

interface DashboardQuickActionProps extends DashboardHeaderProps {
	onHandleShareCollection: () => void;
	onHandleUnfollow: () => void;
}

export function DashboardQuickAction({
	onCreateLink,
	onHandleShareCollection,
	onCreateCollection,
	isFavorite,
	onEditCollection,
	onDeleteCollection,
	onHandleUnfollow,
}: DashboardQuickActionProps) {
	const isMobile = useIsMobile();
	const { activeCollection } = useDashboardProps();
	const [isQuickActionsModalOpen, setIsQuickActionsModalOpen] = useState(false);

	const handleQuickAction = (action: () => void) => {
		action();
		setIsQuickActionsModalOpen(false);
	};

	return (
		<>
			<IconButton
				icon="i-ant-design-plus-circle-outlined"
				onClick={() => setIsQuickActionsModalOpen(true)}
				aria-label="Quick actions"
				variant="ghost"
				className="flex-shrink-0 border border-gray-300/50 dark:border-gray-600/50"
			/>
			<Modal
				isOpen={isQuickActionsModalOpen}
				onClose={() => setIsQuickActionsModalOpen(false)}
				title={<Trans>Quick Actions</Trans>}
				size="sm"
				className="flex flex-col gap-4"
			>
				<div className="flex flex-col gap-2">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						<Trans>Links</Trans>
					</p>
					{activeCollection?.isOwner !== false && (
						<Button
							variant="primary"
							onClick={() => handleQuickAction(onCreateLink)}
						>
							<Trans>
								Create link{' '}
								{!isMobile && <Kbd>{KEYS.OPEN_CREATE_LINK_KEY}</Kbd>}
							</Trans>
						</Button>
					)}
				</div>
				<div className="flex flex-col gap-2">
					<div className="text-sm text-gray-500 dark:text-gray-400">
						<Trans>Collections</Trans>
					</div>
					{activeCollection?.visibility === Visibility.PUBLIC && (
						<Button
							variant="primary"
							onClick={() => handleQuickAction(onHandleShareCollection)}
						>
							<div className="flex items-center gap-2">
								<div className="i-ant-design-share-alt-outlined w-5 h-5" />
								<Trans>Share collection</Trans>
							</div>
						</Button>
					)}

					<Button
						variant="primary"
						onClick={() => handleQuickAction(onCreateCollection)}
						className="text-left justify-between"
					>
						<Trans>
							Create collection{' '}
							{!isMobile && <Kbd>{KEYS.OPEN_CREATE_COLLECTION_KEY}</Kbd>}
						</Trans>
					</Button>

					{!isFavorite && activeCollection?.isOwner !== false && (
						<>
							<Button
								variant="outline"
								onClick={() => handleQuickAction(onEditCollection)}
							>
								<Trans>Edit collection</Trans>
							</Button>
							<Button
								variant="danger"
								onClick={() => handleQuickAction(onDeleteCollection)}
								className="text-left"
							>
								<Trans>Delete collection</Trans>
							</Button>
						</>
					)}

					{!isFavorite && activeCollection?.isOwner === false && (
						<Button
							variant="primary"
							onClick={() => handleQuickAction(onHandleUnfollow)}
						>
							<Trans>Unfollow</Trans>
						</Button>
					)}
				</div>
			</Modal>
		</>
	);
}
