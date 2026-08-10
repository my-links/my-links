import clsx from 'clsx';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import { FollowedLinkRow } from './followed_link_row';
import { shouldSuppressClick } from '@/lib/dnd/drag_click_guard';
import type { FollowedCollectionWithLinks } from '@/lib/api/types';
import { COLLECTION_SECTION, collectionSortableId } from '@/lib/dnd/dnd_types';

interface FollowedCollectionSectionProps {
	collection: FollowedCollectionWithLinks;
	isExpanded: boolean;
	onToggle: () => void;
}

/**
 * Read-only counterpart to `CollectionSection` — no add-link button, no
 * kebab menu (rename/delete belong to the author, not a follower). Sortable
 * within the shared `CollectionsDndProvider` like owned collections, but
 * `isOwner: false` keeps it out of bounds as a link-drop target (see
 * `collision_detection.ts`), and its `section` (`followed`) keeps it from
 * ever colliding with a public/private collection during reorder.
 */
export function FollowedCollectionSection({
	collection,
	isExpanded,
	onToggle,
}: Readonly<FollowedCollectionSectionProps>) {
	const links = collection.links ?? [];
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: collectionSortableId(collection.id),
		data: {
			kind: 'collection',
			collectionId: collection.id,
			section: COLLECTION_SECTION.FOLLOWED,
			isOwner: false,
		},
		animateLayoutChanges: () => false,
	});

	const handleToggle = () => {
		if (shouldSuppressClick()) return;
		onToggle();
	};

	return (
		<div
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
				opacity: isDragging ? 0.5 : undefined,
			}}
			className="mb-1"
		>
			<button
				{...attributes}
				{...listeners}
				onClick={handleToggle}
				aria-expanded={isExpanded}
				className="flex w-full cursor-grab items-center gap-2 rounded-md px-2 py-1.5 text-left active:cursor-grabbing hover:bg-white/50 dark:hover:bg-gray-800/50"
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
			{isExpanded && (
				<div className="ml-1 space-y-0.5 border-l border-gray-200 pl-2 dark:border-gray-700">
					{links.length === 0 ? (
						<p className="px-2 py-1 text-xs text-gray-400">No links yet.</p>
					) : (
						links.map((link) => <FollowedLinkRow key={link.id} link={link} />)
					)}
				</div>
			)}
		</div>
	);
}
