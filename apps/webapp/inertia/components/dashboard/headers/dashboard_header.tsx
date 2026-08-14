import { t } from '@lingui/core/macro';
import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button, IconButton } from '@minimalstuff/ui';

import { cn } from '~/lib/cn';
import { KEYS } from '~/consts/keys';
import { urlFor } from '~/lib/tuyau';
import { Kbd } from '~/components/common/kbd';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { Tooltip } from '~/components/common/tooltip';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { AccountMenu } from '~/components/common/navigation/account_menu';
import { useDashboardLayoutStore } from '~/stores/dashboard_layout_store';
import { DashboardQuickAction } from '~/components/dashboard/headers/dashboard_quick_action';

export interface DashboardHeaderProps {
	isFavorite: boolean;
	onToggleSidebar: () => void;
	onCreateCollection: () => void;
	onEditCollection: () => void;
	onDeleteCollection: () => void;
	onCreateLink: () => void;
	onOpenSearch: () => void;
}

export function DashboardHeader({
	isFavorite,
	onToggleSidebar,
	onCreateCollection,
	onEditCollection,
	onDeleteCollection,
	onCreateLink,
	onOpenSearch,
}: Readonly<DashboardHeaderProps>) {
	const { activeCollection } = useDashboardProps();
	const { sidebarOpen } = useDashboardLayoutStore();
	const isMobile = useIsMobile();
	const collectionDescription = activeCollection?.description ?? undefined;
	// Search and the account menu live in the sidebar; the header carries them
	// only while it is the sole thing on screen.
	const isSidebarHidden = !sidebarOpen || isMobile;

	const handleShareCollection = async () => {
		if (!activeCollection?.id) return;
		const url = `${window.location.origin}${urlFor('shared', { id: activeCollection.id })}`;
		await navigator.clipboard.writeText(url);
	};

	const handleUnfollow = () => {
		if (!activeCollection?.id) return;
		const unfollowUrl = urlFor('collection.unfollow', {
			id: activeCollection.id,
		});
		router.post(unfollowUrl);
	};

	return (
		<header
			className={cn(
				'md:border-b border-gray-200/50 dark:border-gray-700/50 pb-4',
				isSidebarHidden ? 'pl-0' : 'pl-4'
			)}
		>
			<div className="flex flex-col justify-between gap-4">
				<div className="flex items-center gap-4 flex-1">
					<IconButton
						icon="i-ant-design-menu-outlined"
						onClick={onToggleSidebar}
						aria-label="Toggle sidebar"
						variant="outline"
					/>

					{isSidebarHidden && (
						<Tooltip content={<Trans>Search</Trans>} position="bottom">
							<IconButton
								icon="i-ion-search"
								onClick={onOpenSearch}
								aria-label={t`Search`}
								variant="outline"
							/>
						</Tooltip>
					)}

					{!isMobile && activeCollection?.isOwner !== false && (
						<Button color="primary" onClick={onCreateLink} variant="subtle">
							<Trans>
								Create link <Kbd>{KEYS.OPEN_CREATE_LINK_KEY}</Kbd>
							</Trans>
						</Button>
					)}

					{!isMobile && activeCollection?.visibility === 'PUBLIC' && (
						<Tooltip
							content={<Trans>Click to copy link</Trans>}
							temporaryContent={<Trans>Copied!</Trans>}
							showOnClick
							position="bottom"
						>
							<IconButton
								icon="i-ant-design-share-alt-outlined"
								onClick={() => void handleShareCollection()}
								aria-label="Share collection"
								variant="outline"
								size="md"
							/>
						</Tooltip>
					)}

					{isMobile && (
						<DashboardQuickAction
							onCreateLink={onCreateLink}
							onHandleShareCollection={() => void handleShareCollection()}
							onCreateCollection={onCreateCollection}
							isFavorite={isFavorite}
							onEditCollection={onEditCollection}
							onDeleteCollection={onDeleteCollection}
							onHandleUnfollow={handleUnfollow}
							onToggleSidebar={onToggleSidebar}
							onOpenSearch={onOpenSearch}
						/>
					)}

					{isSidebarHidden && (
						<div className="ml-auto max-w-[200px]">
							<AccountMenu side="bottom" />
						</div>
					)}
				</div>

				{!isMobile && !isFavorite && activeCollection?.isOwner === false && (
					<div className="w-full flex items-center gap-2 flex-wrap">
						<Button color="danger" onClick={handleUnfollow}>
							<Trans>Unfollow</Trans>
						</Button>
					</div>
				)}
			</div>

			{collectionDescription && (
				<div className="mt-4">
					<p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line break-words">
						{collectionDescription}
					</p>
				</div>
			)}
		</header>
	);
}
