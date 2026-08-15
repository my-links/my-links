import { useMemo } from 'react';
import { t } from '@lingui/core/macro';
import { Head } from '@inertiajs/react';
import { Modal } from '@minimalstuff/ui';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import useShortcut from '~/hooks/use_shortcut';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { useSidebarMode } from '~/hooks/use_sidebar_mode';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { DashboardTour } from '~/components/tour/dashboard_tour';
import { SearchModal } from '~/components/dashboard/modals/search_modal';
import { useRefetchOnTabRefocus } from '~/hooks/use_refetch_on_tab_refocus';
import { SidebarFooter } from '~/components/dashboard/sidebar/sidebar_footer';
import { SidebarHeader } from '~/components/dashboard/sidebar/sidebar_header';
import { DashboardHeader } from '~/components/dashboard/headers/dashboard_header';
import { CreateLinkModal } from '~/components/dashboard/modals/create_link_modal';
import { CollectionList } from '~/components/dashboard/collections/collection_list';
import { ResizableSidebar } from '~/components/dashboard/sidebar/resizable_sidebar';
import { DashboardDndProvider } from '~/components/dashboard/dnd/dashboard_dnd_provider';
import { EditCollectionModal } from '~/components/dashboard/modals/edit_collection_modal';
import { FavoritesViewContent } from '~/components/dashboard/views/favorites_view_content';
import { CollectionViewContent } from '~/components/dashboard/views/collection_view_content';
import { CreateCollectionModal } from '~/components/dashboard/modals/create_collection_modal';
import { DeleteCollectionModal } from '~/components/dashboard/modals/delete_collection_modal';
import { useDashboardLayoutStore as useDashboardStore } from '~/stores/dashboard_layout_store';

export interface DashboardProps {
	followedCollections?: Data.Collection[];
	myPublicCollections?: Data.Collection[];
	myPrivateCollections?: Data.Collection[];
	// Not optional: every account has an Inbox, and both controllers that render
	// this page open one on read for the accounts that somehow don't.
	inboxCollection: Data.Collection;
	activeCollection?: Data.Collection.Variants['withLinks'] | null;
	favoriteLinks?: Data.Link[];
}

export default function Dashboard() {
	const { activeCollection, favoriteLinks } = useDashboardProps();

	useRefetchOnTabRefocus();

	const isMobile = useIsMobile();
	const sidebarMode = useSidebarMode();
	const { toggleSidebar } = useDashboardStore();

	const isFavorite = !activeCollection?.id;

	// Both controllers always send `activeCollection` (object or `null`); only an unset prop should hit the placeholder.
	const hasActiveContent = activeCollection !== undefined;

	const handleCreateCollection = (message?: string) => {
		const call = Modal.call({
			title: t`Create a collection`,
			children: (
				<CreateCollectionModal
					message={message}
					onClose={() => Modal.end(call, undefined)}
				/>
			),
		});
	};

	const handleEditCollection = () => {
		if (
			!activeCollection ||
			activeCollection.isOwner === false ||
			activeCollection.isDefault
		)
			return;
		const call = Modal.call({
			title: t`Edit a collection`,
			children: (
				<EditCollectionModal onClose={() => Modal.end(call, undefined)} />
			),
		});
	};

	const handleDeleteCollection = () => {
		if (
			!activeCollection ||
			activeCollection.isOwner === false ||
			activeCollection.isDefault
		)
			return;
		const call = Modal.call({
			title: t`Delete a collection`,
			children: (
				<DeleteCollectionModal onClose={() => Modal.end(call, undefined)} />
			),
		});
	};

	const handleCreateLink = () => {
		if (activeCollection?.isOwner === false) return;
		const call = Modal.call({
			title: t`Create a link`,
			children: <CreateLinkModal onClose={() => Modal.end(call, undefined)} />,
		});
	};

	const handleOpenSearch = () => {
		const call = Modal.call({
			title: t`Search`,
			size: 'lg',
			children: <SearchModal onClose={() => Modal.end(call, undefined)} />,
		});
	};

	const pageTitle = useMemo(() => {
		if (activeCollection) {
			const icon = activeCollection.icon ? `${activeCollection.icon} ` : '';
			return `${icon}${activeCollection.name}`;
		}

		if (favoriteLinks?.length) {
			return t`Favorites`;
		}

		return t`Dashboard`;
	}, [activeCollection, favoriteLinks]);

	useShortcut('OPEN_SEARCH_KEY', handleOpenSearch, { enabled: !isMobile });
	useShortcut('OPEN_CREATE_COLLECTION_KEY', handleCreateCollection, {
		enabled: !isMobile,
	});
	useShortcut('OPEN_CREATE_LINK_KEY', handleCreateLink, { enabled: !isMobile });

	return (
		<>
			{pageTitle && <Head title={pageTitle} />}
			<DashboardTour />
			<DashboardDndProvider>
				<div className="flex h-full w-full">
					{sidebarMode !== 'hidden' && (
						<ResizableSidebar>
							<aside className="h-full border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
								<SidebarHeader onOpenSearch={handleOpenSearch} />
								<CollectionList onCreateCollection={handleCreateCollection} />
								<SidebarFooter />
							</aside>
						</ResizableSidebar>
					)}

					<div className="flex-1 flex flex-col min-w-0">
						<DashboardHeader
							isFavorite={isFavorite}
							onToggleSidebar={toggleSidebar}
							onCreateCollection={handleCreateCollection}
							onEditCollection={handleEditCollection}
							onDeleteCollection={handleDeleteCollection}
							onCreateLink={handleCreateLink}
							onOpenSearch={handleOpenSearch}
						/>

						<div
							className="flex-1 overflow-y-auto md:p-6 scrollbar-gutter-stable"
							scroll-region=""
						>
							{hasActiveContent ? (
								<>
									{activeCollection ? (
										<CollectionViewContent />
									) : (
										<FavoritesViewContent />
									)}
								</>
							) : (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<div className="i-ant-design-folder-outlined w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
									<p className="text-gray-500 dark:text-gray-400 mb-2">
										<Trans>Select a collection to view its links</Trans>
									</p>
									<p className="text-sm text-gray-400 dark:text-gray-500">
										<Trans>Or create a new collection to get started</Trans>
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</DashboardDndProvider>
		</>
	);
}
