import { CollectionWithLinks, Link as LinkType } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Trans as TransComponent } from '@lingui/react';
import clsx from 'clsx';
import { useState } from 'react';
import { CollectionList } from '~/components/new_dashboard/collection_list';
import { LinkList } from '~/components/new_dashboard/link_list';
import { ResizableSidebar } from '~/components/new_dashboard/resizable_sidebar';
import { CreateCollectionModal } from '~/components/new_dashboard/modals/create_collection_modal';
import { EditCollectionModal } from '~/components/new_dashboard/modals/edit_collection_modal';
import { DeleteCollectionModal } from '~/components/new_dashboard/modals/delete_collection_modal';
import { CreateLinkModal } from '~/components/new_dashboard/modals/create_link_modal';
import { Modal } from '~/components/common/modal';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import { useDashboardLayoutStore } from '~/stores/dashboard_layout_store';
import { Visibility } from '~/types/app';

interface NewDashboardProps extends PageProps {
	collections: CollectionWithLinks[];
	favoriteLinks: LinkType[];
	activeCollection?: CollectionWithLinks | null;
}

export default function NewDashboard() {
	const { props } = usePage<NewDashboardProps>();
	const { layout, setLayout, sidebarOpen, toggleSidebar } =
		useDashboardLayoutStore();
	const isMobile = useIsMobile();
	const tuyau = useTuyauRequired();
	const [searchQuery, setSearchQuery] = useState('');

	const activeCollection = props.activeCollection;
	const isFavorite = !activeCollection?.id;

	const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
	const [editCollectionOpen, setEditCollectionOpen] = useState(false);
	const [deleteCollectionOpen, setDeleteCollectionOpen] = useState(false);
	const [createLinkOpen, setCreateLinkOpen] = useState(false);

	const layoutOptions: Array<{
		value: typeof layout;
		icon: string;
		label: string;
	}> = [
		{
			value: 'list',
			icon: 'i-ant-design-unordered-list-outlined',
			label: 'List',
		},
		{ value: 'grid', icon: 'i-ant-design-appstore-outlined', label: 'Grid' },
		{
			value: 'masonry',
			icon: 'i-ant-design-pic-center-outlined',
			label: 'Masonry',
		},
		{
			value: 'compact',
			icon: 'i-ant-design-compress-outlined',
			label: 'Compact',
		},
	];

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
				<header className="border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-4 flex-1 min-w-0">
							<button
								onClick={toggleSidebar}
								className="cursor-pointer p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors flex-shrink-0"
								aria-label="Toggle sidebar"
							>
								<div className="i-ant-design-menu-outlined w-5 h-5" />
							</button>

							<div className="flex-1 max-w-md">
								<input
									type="text"
									placeholder="Search..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300/50 dark:border-gray-600/50 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									disabled
								/>
							</div>
						</div>

						<div className="flex items-center gap-2 flex-shrink-0">
							{activeCollection?.visibility === Visibility.PUBLIC && (
								<>
									<button
										className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
										title="Share collection"
									>
										<div className="i-ant-design-share-alt-outlined w-5 h-5" />
									</button>
									<div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
								</>
							)}

							<button
								onClick={() => setCreateCollectionOpen(true)}
								className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
							>
								<Trans>Create collection</Trans>
							</button>

							{!isFavorite && (
								<>
									<button
										onClick={() => setEditCollectionOpen(true)}
										className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
									>
										<Trans>Edit collection</Trans>
									</button>
									<button
										onClick={() => setDeleteCollectionOpen(true)}
										className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
									>
										<Trans>Delete collection</Trans>
									</button>
								</>
							)}

							<div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

							<button
								onClick={() => setCreateLinkOpen(true)}
								className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
							>
								<Trans>Create link</Trans>
							</button>
						</div>
					</div>

					{activeCollection?.description && (
						<div className="mt-4">
							<p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line break-words">
								{activeCollection.description}
							</p>
						</div>
					)}
				</header>

				<div className="flex-1 overflow-y-auto p-6 scrollbar-gutter-stable">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
								{isFavorite ? (
									<Trans>Favorite Links</Trans>
								) : (
									activeCollection?.name
								)}
							</h1>
							{!isFavorite &&
								activeCollection &&
								'links' in activeCollection &&
								Array.isArray(activeCollection.links) && (
									<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
										{activeCollection.links.length}{' '}
										{activeCollection.links.length === 1 ? (
											<Trans>link</Trans>
										) : (
											<Trans>links</Trans>
										)}
									</p>
								)}
						</div>

						{!isMobile && (
							<div className="flex items-center gap-1 p-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50">
								{layoutOptions.map((option) => (
									<button
										key={option.value}
										onClick={() => setLayout(option.value)}
										className={clsx(
											'cursor-pointer p-2 rounded transition-colors',
											layout === option.value
												? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
												: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
										)}
										title={option.label}
										aria-label={option.label}
									>
										<div className={clsx(option.icon, 'w-5 h-5')} />
									</button>
								))}
							</div>
						)}
					</div>

					<LinkList />
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

			{activeCollection && (
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

			<Modal
				isOpen={createLinkOpen}
				onClose={() => setCreateLinkOpen(false)}
				title={
					<TransComponent id="common:link.create" message="Create a link" />
				}
			>
				<CreateLinkModal
					collections={props.collections}
					defaultCollectionId={activeCollection?.id}
					onClose={() => setCreateLinkOpen(false)}
				/>
			</Modal>
		</div>
	);
}
