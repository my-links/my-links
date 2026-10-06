import { Head } from '@inertiajs/react';
import type { Data } from '@generated/data';

import { AppLayout } from '~/layouts/app_layout';
import { useSidebarMode } from '~/hooks/use_sidebar_mode';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { DashboardTour } from '~/components/tour/dashboard_tour';
import { useDashboardModals } from '~/hooks/use_dashboard_modals';
import { useDashboardPageTitle } from '~/hooks/use_dashboard_page_title';
import { useRefetchOnTabRefocus } from '~/hooks/use_refetch_on_tab_refocus';
import { SidebarFooter } from '~/components/dashboard/sidebar/sidebar_footer';
import { SidebarHeader } from '~/components/dashboard/sidebar/sidebar_header';
import { DashboardContent } from '~/components/dashboard/views/dashboard_content';
import { DashboardHeader } from '~/components/dashboard/headers/dashboard_header';
import { CollectionList } from '~/components/dashboard/collections/collection_list';
import { ResizableSidebar } from '~/components/dashboard/sidebar/resizable_sidebar';
import { DashboardDndProvider } from '~/components/dashboard/dnd/dashboard_dnd_provider';
import { useDashboardLayoutStore as useDashboardStore } from '~/stores/dashboard_layout_store';

export type DashboardProps = {
	followedCollections?: Data.Collection[];
	myPublicCollections?: Data.Collection[];
	myPrivateCollections?: Data.Collection[];
	// Not optional: every account has an Inbox, and both controllers that render
	// this page open one on read for the accounts that somehow don't.
	inboxCollection: Data.Collection;
	activeCollection?: Data.Collection.Variants['withLinks'] | null;
	favoriteLinks?: Data.Link[];
};

export default function Dashboard() {
	const { activeCollection } = useDashboardProps();

	useRefetchOnTabRefocus();

	const sidebarMode = useSidebarMode();
	const { toggleSidebar } = useDashboardStore();

	const isFavorite = !activeCollection?.id;

	const pageTitle = useDashboardPageTitle();
	const {
		handleCreateCollection,
		handleEditCollection,
		handleDeleteCollection,
		handleCreateLink,
		handleOpenSearch,
	} = useDashboardModals();

	return (
		<>
			{pageTitle && <Head title={pageTitle} />}
			<DashboardTour />
			<DashboardDndProvider>
				<div className="flex h-full w-full">
					{sidebarMode !== 'hidden' && (
						<ResizableSidebar>
							<aside className="h-full border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
								<SidebarHeader
									onToggleSidebar={toggleSidebar}
									onOpenSearch={handleOpenSearch}
								/>
								<CollectionList />
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
							className="flex-1 overflow-y-auto md:p-4 md:pr-1 scrollbar-gutter-stable"
							scroll-region=""
						>
							<DashboardContent />
						</div>
					</div>
				</div>
			</DashboardDndProvider>
		</>
	);
}

Dashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
