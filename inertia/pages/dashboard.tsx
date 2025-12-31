import { Collection, CollectionWithLinks, Link } from '#shared/types/dto';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { CollectionList } from '~/components/dashboard/collections/collection_list';
import { DashboardHeader } from '~/components/dashboard/headers/dashboard_header';
import { CreateCollectionModal } from '~/components/dashboard/modals/create_collection_modal';
import { CreateLinkModal } from '~/components/dashboard/modals/create_link_modal';
import { DeleteCollectionModal } from '~/components/dashboard/modals/delete_collection_modal';
import { EditCollectionModal } from '~/components/dashboard/modals/edit_collection_modal';
import { ResizableSidebar } from '~/components/dashboard/sidebar/resizable_sidebar';
import { CollectionViewContent } from '~/components/dashboard/views/collection_view_content';
import { FavoritesViewContent } from '~/components/dashboard/views/favorites_view_content';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { useDashboardLayoutStore as useDashboardStore } from '~/stores/dashboard_layout_store';
import { useModalStore } from '~/stores/modal_store';

export interface DashboardProps {
	followedCollections: Collection[];
	myPublicCollections: Collection[];
	myPrivateCollections: Collection[];
	activeCollection?: CollectionWithLinks | null;
	favoriteLinks?: Link[];
}

export default function Dashboard() {
	const { activeCollection, favoriteLinks } = useDashboardProps();

	const { sidebarOpen, toggleSidebar } = useDashboardStore();
	const [searchQuery, setSearchQuery] = useState('');

	const openModal = useModalStore((state) => state.open);
	const closeAll = useModalStore((state) => state.closeAll);

	const isFavorite = !activeCollection?.id;

	const hasActiveContent =
		!!activeCollection || (favoriteLinks?.length ?? 0) > 0;

	const handleCreateCollection = () => {
		openModal({
			title: t`Create a collection`,
			children: <CreateCollectionModal onClose={closeAll} />,
		});
	};

	const handleEditCollection = () => {
		if (!activeCollection || activeCollection.isOwner === false) return;
		openModal({
			title: t`Edit a collection`,
			children: <EditCollectionModal onClose={closeAll} />,
		});
	};

	const handleDeleteCollection = () => {
		if (!activeCollection || activeCollection.isOwner === false) return;
		openModal({
			title: t`Delete a collection`,
			children: <DeleteCollectionModal onClose={closeAll} />,
		});
	};

	const handleCreateLink = () => {
		if (activeCollection?.isOwner === false) return;
		openModal({
			title: t`Create a link`,
			children: <CreateLinkModal onClose={closeAll} />,
		});
	};

	return (
		<div className="flex h-full w-full">
			{sidebarOpen && (
				<ResizableSidebar>
					<aside className="h-full border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
						<CollectionList />
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
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
				/>

				<div className="flex-1 overflow-y-auto p-6 scrollbar-gutter-stable">
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
	);
}
