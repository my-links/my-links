import { Trans } from '@lingui/react/macro';
import { Button, IconButton, Modal } from '@minimalstuff/ui';

import { KEYS } from '~/consts/keys';
import { Kbd } from '~/components/common/kbd';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { DashboardHeaderProps } from '~/components/dashboard/headers/dashboard_header';

interface DashboardQuickActionProps extends DashboardHeaderProps {
	onHandleShareCollection: () => void;
	onHandleUnfollow: () => void;
}

export function DashboardQuickAction(
	props: Readonly<DashboardQuickActionProps>
) {
	const handleOpen = () => {
		const call = Modal.call({
			title: <Trans>Quick Actions</Trans>,
			size: 'sm',
			className: 'flex flex-col gap-4',
			children: (
				<QuickActionsContent
					{...props}
					onClose={() => Modal.end(call, undefined)}
				/>
			),
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

interface QuickActionsContentProps extends DashboardQuickActionProps {
	onClose: () => void;
}

function QuickActionsContent({
	onCreateLink,
	onHandleShareCollection,
	onCreateCollection,
	onOpenSearch,
	isFavorite,
	onEditCollection,
	onDeleteCollection,
	onHandleUnfollow,
	onClose,
}: Readonly<QuickActionsContentProps>) {
	const isMobile = useIsMobile();
	const { activeCollection } = useDashboardProps();

	const handleQuickAction = (action: () => void) => {
		action();
		onClose();
	};

	return (
		<>
			<Button
				variant="outline"
				onClick={() => handleQuickAction(onOpenSearch)}
				startIcon="i-ion-search"
			>
				<Trans>Search</Trans>
			</Button>

			<div className="flex flex-col gap-2">
				<p className="text-sm text-gray-500 dark:text-gray-400">
					<Trans>Links</Trans>
				</p>
				{activeCollection?.isOwner !== false && (
					<Button
						color="primary"
						onClick={() => handleQuickAction(onCreateLink)}
					>
						<Trans>
							Create link {!isMobile && <Kbd>{KEYS.OPEN_CREATE_LINK_KEY}</Kbd>}
						</Trans>
					</Button>
				)}
			</div>
			<div className="flex flex-col gap-2">
				<div className="text-sm text-gray-500 dark:text-gray-400">
					<Trans>Collections</Trans>
				</div>
				{activeCollection?.visibility === 'PUBLIC' && (
					<Button
						color="primary"
						onClick={() => handleQuickAction(onHandleShareCollection)}
					>
						<div className="flex items-center gap-2">
							<div className="i-ant-design-share-alt-outlined w-5 h-5" />
							<Trans>Share collection</Trans>
						</div>
					</Button>
				)}

				<Button
					variant="subtle"
					onClick={() => handleQuickAction(onCreateCollection)}
				>
					<Trans>
						Create collection{' '}
						{!isMobile && <Kbd>{KEYS.OPEN_CREATE_COLLECTION_KEY}</Kbd>}
					</Trans>
				</Button>

				{!isFavorite &&
					activeCollection?.isOwner !== false &&
					!activeCollection?.isDefault && (
						<>
							<Button
								variant="outline"
								onClick={() => handleQuickAction(onEditCollection)}
							>
								<Trans>Edit collection</Trans>
							</Button>
							<Button
								color="danger"
								onClick={() => handleQuickAction(onDeleteCollection)}
								className="text-left"
							>
								<Trans>Delete collection</Trans>
							</Button>
						</>
					)}

				{!isFavorite && activeCollection?.isOwner === false && (
					<Button
						color="primary"
						onClick={() => handleQuickAction(onHandleUnfollow)}
					>
						<Trans>Unfollow</Trans>
					</Button>
				)}
			</div>
		</>
	);
}
