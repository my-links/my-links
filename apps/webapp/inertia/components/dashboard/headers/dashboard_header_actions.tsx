import { Trans } from '@lingui/react/macro';
import { Button, IconButton, Kbd, Tooltip } from '@minimalstuff/ui';

import { KEYS } from '~/consts/keys';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { FilterList } from '~/components/common/filter_list';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import type { DashboardHeaderProps } from '~/components/dashboard/headers/dashboard_header';
import { DashboardQuickAction } from '~/components/dashboard/headers/dashboard_quick_action';

type DashboardHeaderActionsProps = DashboardHeaderProps & {
	onShareCollection: () => void;
	onUnfollow: () => void;
};

export function DashboardHeaderActions({
	isFavorite,
	onToggleSidebar,
	onCreateCollection,
	onEditCollection,
	onDeleteCollection,
	onCreateLink,
	onOpenSearch,
	onShareCollection,
	onUnfollow,
}: Readonly<DashboardHeaderActionsProps>) {
	const { activeCollection } = useDashboardProps();
	const isMobile = useIsMobile();

	return (
		<div className="flex items-center gap-2 flex-wrap flex-shrink-0">
			{/* Desktop keeps its toggle in the sidebar, which never leaves
the screen; mobile hides the sidebar outright and needs one here. */}
			{isMobile && (
				<IconButton
					icon="i-ant-design-menu-outlined"
					onClick={onToggleSidebar}
					aria-label="Toggle sidebar"
					variant="outline"
				/>
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
						onClick={onShareCollection}
						aria-label="Share collection"
						variant="outline"
						size="md"
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

			{!isMobile && (
				<Button
					variant="subtle"
					onClick={onCreateCollection}
					data-tour="create-collection"
				>
					<Trans>
						Create collection <Kbd>{KEYS.OPEN_CREATE_COLLECTION_KEY}</Kbd>
					</Trans>
				</Button>
			)}

			{!isMobile && <FilterList layoutStoreKey="dashboard" />}

			{isMobile && (
				<DashboardQuickAction
					onCreateLink={onCreateLink}
					onHandleShareCollection={onShareCollection}
					onCreateCollection={onCreateCollection}
					isFavorite={isFavorite}
					onEditCollection={onEditCollection}
					onDeleteCollection={onDeleteCollection}
					onHandleUnfollow={onUnfollow}
					onToggleSidebar={onToggleSidebar}
					onOpenSearch={onOpenSearch}
				/>
			)}
		</div>
	);
}
