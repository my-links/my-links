import { KEYS } from '#constants/keys';
import { Visibility } from '#enums/collections/visibility';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
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

	const Button = ({
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick: () => void;
	}) => (
		<button
			onClick={onClick}
			className="w-full cursor-pointer px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left flex items-center justify-between"
		>
			{children}
		</button>
	);

	return (
		<>
			<button
				onClick={() => setIsQuickActionsModalOpen(true)}
				className="cursor-pointer p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors flex-shrink-0 border border-gray-300/50 dark:border-gray-600/50"
				aria-label="Quick actions"
			>
				<div className="i-ant-design-plus-circle-outlined w-5 h-5" />
			</button>
			<Modal
				isOpen={isQuickActionsModalOpen}
				onClose={() => setIsQuickActionsModalOpen(false)}
				title={<Trans>Quick Actions</Trans>}
				size="sm"
			>
				<div className="flex flex-col gap-2">
					{activeCollection?.isOwner !== false && (
						<Button onClick={() => handleQuickAction(onCreateLink)}>
							<Trans>
								Create link{' '}
								{!isMobile && <Kbd>{KEYS.OPEN_CREATE_LINK_KEY}</Kbd>}
							</Trans>
						</Button>
					)}

					{activeCollection?.visibility === Visibility.PUBLIC && (
						<Button onClick={() => handleQuickAction(onHandleShareCollection)}>
							<div className="i-ant-design-share-alt-outlined w-5 h-5" />
							<Trans>Share collection</Trans>
						</Button>
					)}

					<Button onClick={() => handleQuickAction(onCreateCollection)}>
						<Trans>
							Create collection{' '}
							{!isMobile && <Kbd>{KEYS.OPEN_CREATE_COLLECTION_KEY}</Kbd>}
						</Trans>
					</Button>

					{!isFavorite && activeCollection?.isOwner !== false && (
						<>
							<Button onClick={() => handleQuickAction(onEditCollection)}>
								<Trans>Edit collection</Trans>
							</Button>
							<Button onClick={() => handleQuickAction(onDeleteCollection)}>
								<Trans>Delete collection</Trans>
							</Button>
						</>
					)}

					{!isFavorite && activeCollection?.isOwner === false && (
						<Button onClick={() => handleQuickAction(onHandleUnfollow)}>
							<Trans>Unfollow</Trans>
						</Button>
					)}
				</div>
			</Modal>
		</>
	);
}
