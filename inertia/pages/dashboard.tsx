import { Collection, CollectionWithLinks, Link } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { Trans as TransComponent } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { Modal } from '~/components/common/modal';
import { CollectionList } from '~/components/dashboard/collections/collection_list';
import { CollectionViewContent } from '~/components/dashboard/views/collection_view_content';
import { DashboardHeader } from '~/components/dashboard/headers/dashboard_header';
import { FavoritesViewContent } from '~/components/dashboard/views/favorites_view_content';
import { CreateCollectionModal } from '~/components/dashboard/modals/create_collection_modal';
import { CreateLinkModal } from '~/components/dashboard/modals/create_link_modal';
import { DeleteCollectionModal } from '~/components/dashboard/modals/delete_collection_modal';
import { EditCollectionModal } from '~/components/dashboard/modals/edit_collection_modal';
import { ResizableSidebar } from '~/components/dashboard/sidebar/resizable_sidebar';
import { useDashboardLayoutStore as useDashboardStore } from '~/stores/dashboard_layout_store';

interface DashboardProps extends PageProps {
	followedCollections: Collection[];
	myPublicCollections: Collection[];
	myPrivateCollections: Collection[];
	activeCollection?: CollectionWithLinks | null;
	favoriteLinks?: Link[];
}

export default function Dashboard({
	followedCollections = [] as Collection[],
	myPublicCollections = [] as Collection[],
	myPrivateCollections = [] as Collection[],
	activeCollection = null,
	favoriteLinks = [] as Link[],
}: DashboardProps) {
	const { sidebarOpen, toggleSidebar } = useDashboardStore();
	const [searchQuery, setSearchQuery] = useState('');

	const isFavorite = !activeCollection?.id;
	const allCollections = [
		...followedCollections,
		...myPublicCollections,
		...myPrivateCollections,
	];

	const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
	const [editCollectionOpen, setEditCollectionOpen] = useState(false);
	const [deleteCollectionOpen, setDeleteCollectionOpen] = useState(false);
	const [createLinkOpen, setCreateLinkOpen] = useState(false);

	const hasActiveContent = !!activeCollection || favoriteLinks.length > 0;

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
					activeCollection={activeCollection}
					isFavorite={isFavorite}
					onToggleSidebar={toggleSidebar}
					onCreateCollection={() => setCreateCollectionOpen(true)}
					onEditCollection={() => setEditCollectionOpen(true)}
					onDeleteCollection={() => setDeleteCollectionOpen(true)}
					onCreateLink={() => setCreateLinkOpen(true)}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
				/>

				<div className="flex-1 overflow-y-auto p-6 scrollbar-gutter-stable">
					{hasActiveContent ? (
						<>
							{activeCollection ? (
								<CollectionViewContent collection={activeCollection} />
							) : (
								<FavoritesViewContent favoriteLinks={favoriteLinks} />
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

			<Modal
				isOpen={createCollectionOpen}
				onClose={() => setCreateCollectionOpen(false)}
				title={
					<TransComponent
						id="common:collection.create"
						message="Create a collection"
					/>
				}
			>
				<CreateCollectionModal onClose={() => setCreateCollectionOpen(false)} />
			</Modal>

			{activeCollection && activeCollection.isOwner !== false && (
				<>
					<Modal
						isOpen={editCollectionOpen}
						onClose={() => setEditCollectionOpen(false)}
						title={
							<TransComponent
								id="common:collection.edit"
								message="Edit a collection"
							/>
						}
					>
						<EditCollectionModal
							collection={activeCollection}
							onClose={() => setEditCollectionOpen(false)}
						/>
					</Modal>

					<Modal
						isOpen={deleteCollectionOpen}
						onClose={() => setDeleteCollectionOpen(false)}
						title={
							<TransComponent
								id="common:collection.delete"
								message="Delete a collection"
							/>
						}
					>
						<DeleteCollectionModal
							collection={activeCollection}
							onClose={() => setDeleteCollectionOpen(false)}
						/>
					</Modal>
				</>
			)}

			{activeCollection?.isOwner !== false && (
				<Modal
					isOpen={createLinkOpen}
					onClose={() => setCreateLinkOpen(false)}
					title={
						<TransComponent id="common:link.create" message="Create a link" />
					}
				>
					<CreateLinkModal
						collections={allCollections}
						defaultCollectionId={activeCollection?.id}
						onClose={() => setCreateLinkOpen(false)}
					/>
				</Modal>
			)}
		</div>
	);
}
