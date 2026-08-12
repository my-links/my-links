import { Trans } from '@lingui/react/macro';

import { useIsMobile } from '~/hooks/use_is_mobile';
import { useLayoutStore } from '~/stores/layout_store';
import { LinkList } from '~/components/common/link_list';
import { FilterList } from '~/components/common/filter_list';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { SortableLinkList } from '~/components/dashboard/links/sortable_link_list';
import { useDashboardDndCollections } from '~/components/dashboard/dnd/dashboard_dnd_provider';

export function CollectionViewContent() {
	const isMobile = useIsMobile();
	const { layout } = useLayoutStore('dashboard');
	const { activeCollection } = useDashboardProps();
	const { activeCollectionLinks } = useDashboardDndCollections();
	const links = activeCollection?.links ?? [];
	const isOwner = activeCollection?.isOwner !== false;
	const isPublic = activeCollection?.visibility === 'PUBLIC';
	const followersCount = activeCollection?.followersCount ?? 0;
	const hasLinksMeta = links.length > 0;
	const hasFollowersMeta = isPublic && followersCount > 0;
	const effectiveLayout = isMobile ? 'list' : layout;
	const canReorderLinks =
		!!activeCollection &&
		isOwner &&
		effectiveLayout !== 'masonry' &&
		!isMobile &&
		links.length > 0;

	return (
		<>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
						{activeCollection?.icon && (
							<span className="text-2xl">{activeCollection.icon}</span>
						)}
						{activeCollection?.name}
					</h1>
					<div className="mt-1 flex items-center gap-2">
						{hasLinksMeta && (
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{links.length}{' '}
								{links.length === 1 ? (
									<Trans>link</Trans>
								) : (
									<Trans>links</Trans>
								)}
							</p>
						)}
						{hasFollowersMeta && (
							<>
								{hasLinksMeta && (
									<span className="text-gray-400 dark:text-gray-600">•</span>
								)}
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{followersCount}{' '}
									{followersCount === 1 ? (
										<Trans>follower</Trans>
									) : (
										<Trans>followers</Trans>
									)}
								</p>
							</>
						)}
						{!isOwner && activeCollection?.author && (
							<>
								{(hasLinksMeta || hasFollowersMeta) && (
									<span className="text-gray-400 dark:text-gray-600">•</span>
								)}
								<p className="text-sm text-gray-500 dark:text-gray-400">
									<Trans>
										Created by <b>{activeCollection.author.fullname}</b>
									</Trans>
								</p>
							</>
						)}
					</div>
				</div>

				{!isMobile && <FilterList layoutStoreKey="dashboard" />}
			</div>

			{canReorderLinks && activeCollection ? (
				<SortableLinkList
					links={activeCollectionLinks}
					collectionId={activeCollection.id}
					layout={effectiveLayout}
				/>
			) : (
				<LinkList
					links={links}
					layoutStoreKey="dashboard"
					emptyStateHint={<Trans>Create your first link to get started</Trans>}
				/>
			)}
		</>
	);
}
