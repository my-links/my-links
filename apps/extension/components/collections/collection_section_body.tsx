import clsx from 'clsx';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from '@dnd-kit/core';
import {
	ContextMenu,
	IconButton,
	MenuItem,
	Modal,
	ConfirmModal,
	Tooltip,
} from '@minimalstuff/ui';

import { LinkRow } from './link_row';
import { linkSortableId } from '@/lib/dnd/dnd_types';
import { useCollections } from '@/hooks/use_collections';
import type { CollectionWithLinks } from '@/lib/api/types';
import { KebabMenu } from '@/components/common/kebab_menu';
import { EditCollectionModal } from './edit_collection_modal';
import { shouldSuppressClick } from '@/lib/dnd/drag_click_guard';
import { useDeleteCollection } from '@/hooks/use_delete_collection';
import { KebabMenuItem } from '@/components/common/kebab_menu_item';
import { CreateLinkModal } from '@/components/links/create_link_modal';

interface CollectionSectionBodyProps {
	collection: CollectionWithLinks;
	isExpanded: boolean;
	onToggle: () => void;
	dragAttributes?: DraggableAttributes;
	dragListeners?: DraggableSyntheticListeners;
	setActivatorNodeRef?: (element: HTMLElement | null) => void;
}

/**
 * A collection row: header, links, everything but how it participates in
 * dnd-kit. `CollectionSection` wraps it as a draggable-and-sortable row;
 * `PinnedCollectionSection` wraps it as a fixed drop target for the Inbox.
 * Drag props are optional so the pinned variant can render this without them
 * — a droppable alone has no `attributes`/`listeners` to spread.
 */
export function CollectionSectionBody({
	collection,
	isExpanded,
	onToggle,
	dragAttributes,
	dragListeners,
	setActivatorNodeRef,
}: Readonly<CollectionSectionBodyProps>) {
	const { collections } = useCollections();
	const deleteCollection = useDeleteCollection();
	const links = collection.links ?? [];

	const handleToggle = () => {
		if (shouldSuppressClick()) return;
		onToggle();
	};

	const handleAddLink = () => {
		const call = Modal.call({
			title: 'Add link',
			children: (
				<CreateLinkModal
					collections={collections}
					initialValues={{ collectionIds: [collection.id] }}
					onClose={() => Modal.end(call, undefined)}
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
					onClose={() => Modal.end(call, undefined)}
				/>
			),
		});
	};

	const handleDelete = () => {
		void ConfirmModal.call({
			title: 'Delete collection',
			children:
				links.length > 0
					? `Delete "${collection.name}" and its ${links.length} link${links.length === 1 ? '' : 's'}? This can't be undone.`
					: `Delete "${collection.name}"? This can't be undone.`,
			confirmLabel: 'Delete',
			confirmColor: 'danger',
			onConfirm: () => deleteCollection.mutate(collection.id),
		});
	};

	const rowClassName =
		'relative flex w-full items-center gap-1 rounded-md px-2 py-1.5 hover:bg-white/50 dark:hover:bg-gray-800/50';

	const rowContent = (
		<>
			<button
				ref={setActivatorNodeRef}
				{...dragAttributes}
				{...dragListeners}
				onClick={handleToggle}
				aria-expanded={isExpanded}
				className={clsx(
					'flex min-w-0 flex-1 items-center gap-2 text-left',
					dragListeners && 'cursor-grab active:cursor-grabbing'
				)}
			>
				<div
					className={clsx(
						'i-ant-design-caret-down-filled h-3 w-3 flex-shrink-0 opacity-25 text-gray-500 transition-transform',
						!isExpanded && '-rotate-90'
					)}
				/>
				{collection.icon ? (
					<span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-base">
						{collection.icon}
					</span>
				) : collection.isDefault ? (
					<div className="i-ant-design-inbox-outlined h-5 w-5 flex-shrink-0 text-gray-500" />
				) : (
					<div className="i-ant-design-folder-outlined h-5 w-5 flex-shrink-0 text-gray-500" />
				)}
				<span className="flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
					{collection.name}
				</span>
				<span className="flex-shrink-0 text-xs text-gray-400 transition-opacity group-hover:opacity-0 group-focus-within:opacity-0">
					{links.length}
				</span>
			</button>
			<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-0.5 py-1 pl-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
				<Tooltip content={`Add link to ${collection.name}`} position="bottom">
					<IconButton
						icon="i-ant-design-plus-outlined"
						aria-label={`Add link to ${collection.name}`}
						size="sm"
						variant="ghost"
						onClick={handleAddLink}
					/>
				</Tooltip>
				{/* The default (Inbox) collection can't be renamed or deleted. */}
				{!collection.isDefault && (
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
				)}
			</div>
		</>
	);

	return (
		<>
			{/* The default (Inbox) collection can't be renamed or deleted, so it
			carries no menu at all — right-click falls through to the browser's
			native one. */}
			{collection.isDefault ? (
				<div className={rowClassName}>{rowContent}</div>
			) : (
				<ContextMenu
					className={rowClassName}
					items={
						<>
							<MenuItem icon="i-octicon-pencil" onClick={handleEdit}>
								Edit
							</MenuItem>
							<MenuItem
								icon="i-ion-trash-outline"
								onClick={handleDelete}
								danger
							>
								Delete
							</MenuItem>
						</>
					}
				>
					{rowContent}
				</ContextMenu>
			)}
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
						<SortableContext
							items={links.map((link) => linkSortableId(link.id))}
							strategy={verticalListSortingStrategy}
						>
							{links.map((link) => (
								<LinkRow
									key={link.id}
									link={link}
									collectionId={collection.id}
								/>
							))}
						</SortableContext>
					)}
				</div>
			)}
		</>
	);
}
