import clsx from 'clsx';
import { useState } from 'react';
import { IconButton, Modal, ConfirmModal } from '@minimalstuff/ui';

import { LinkRow } from './link_row';
import { useCollections } from '@/hooks/use_collections';
import type { CollectionWithLinks } from '@/lib/api/types';
import { KebabMenu } from '@/components/common/kebab_menu';
import { EditCollectionModal } from './edit_collection_modal';
import { useDeleteCollection } from '@/hooks/use_delete_collection';
import { KebabMenuItem } from '@/components/common/kebab_menu_item';
import { CreateLinkModal } from '@/components/links/create_link_modal';

interface CollectionSectionProps {
	collection: CollectionWithLinks;
}

export function CollectionSection({
	collection,
}: Readonly<CollectionSectionProps>) {
	const [isExpanded, setIsExpanded] = useState(true);
	const { collections } = useCollections();
	const deleteCollection = useDeleteCollection();
	const links = collection.links ?? [];

	const handleToggle = () => setIsExpanded((previous) => !previous);

	const handleAddLink = () => {
		const call = Modal.call({
			title: 'Add link',
			children: (
				<CreateLinkModal
					collections={collections}
					initialValues={{ collectionIds: [collection.id] }}
					onClose={() => Modal.end(call)}
				/>
			),
		});
	};

	const handleEdit = () => {
		const call = Modal.call({
			title: 'Edit collection',
			children: (
				<EditCollectionModal
					collection={collection}
					onClose={() => Modal.end(call)}
				/>
			),
		});
	};

	const handleDelete = () => {
		void ConfirmModal.call({
			title: 'Delete collection',
			children: `Delete "${collection.name}" and all its links? This can't be undone.`,
			confirmLabel: 'Delete',
			confirmColor: 'red',
			onConfirm: () => deleteCollection.mutate(collection.id),
		});
	};

	return (
		<div className="group mb-1">
			<div className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 hover:bg-white/50 dark:hover:bg-gray-800/50">
				<button
					onClick={handleToggle}
					aria-expanded={isExpanded}
					className="flex min-w-0 flex-1 items-center gap-2 text-left"
				>
					<div
						className={clsx(
							'i-ant-design-down-outlined h-3 w-3 flex-shrink-0 text-gray-500 transition-transform',
							!isExpanded && '-rotate-90'
						)}
					/>
					{collection.icon ? (
						<span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-base">
							{collection.icon}
						</span>
					) : (
						<div className="i-ant-design-folder-outlined h-5 w-5 flex-shrink-0 text-gray-500" />
					)}
					<span className="flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
						{collection.name}
					</span>
					<span className="flex-shrink-0 text-xs text-gray-400">
						{links.length}
					</span>
				</button>
				<div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
					<IconButton
						icon="i-ant-design-plus-outlined"
						aria-label={`Add link to ${collection.name}`}
						size="sm"
						variant="ghost"
						onClick={handleAddLink}
					/>
					<KebabMenu label={`Actions for ${collection.name}`}>
						<KebabMenuItem icon="i-octicon-pencil" onClick={handleEdit}>
							Edit
						</KebabMenuItem>
						<KebabMenuItem
							icon="i-ion-trash-outline"
							onClick={handleDelete}
							isDanger
						>
							Delete
						</KebabMenuItem>
					</KebabMenu>
				</div>
			</div>
			{deleteCollection.isError && (
				<p className="px-2 py-1 text-xs text-red-500">
					Couldn't delete this collection.
				</p>
			)}
			{isExpanded && (
				<div className="ml-1 space-y-0.5 border-l border-gray-200 pl-2 dark:border-gray-700">
					{links.length === 0 ? (
						<p className="px-2 py-1 text-xs text-gray-400">No links yet.</p>
					) : (
						links.map((link) => <LinkRow key={link.id} link={link} />)
					)}
				</div>
			)}
		</div>
	);
}
