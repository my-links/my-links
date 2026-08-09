import clsx from 'clsx';
import { usePage } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { useDroppable } from '@dnd-kit/core';
import { Link } from '@adonisjs/inertia/react';
import { PageProps } from '@adonisjs/inertia/types';

import { useIsMobile } from '~/hooks/use_is_mobile';

interface CollectionInboxItemProps {
	collection: Data.Collection;
}

interface PagePropsWithActiveCollection extends PageProps {
	activeCollection?: Data.Collection | null;
}

/**
 * The Inbox, pinned beside the favorites rather than listed among the
 * collections the user orders. It stays a drop target for a link — that is the
 * gesture for "file this nowhere in particular" — but is never draggable
 * itself, so it takes a plain droppable instead of `useSortable`.
 */
export function CollectionInboxItem({
	collection,
}: Readonly<CollectionInboxItemProps>) {
	const { props } = usePage<PagePropsWithActiveCollection>();
	const isMobile = useIsMobile();
	const isActive = collection.id === props.activeCollection?.id;

	const { setNodeRef } = useDroppable({
		id: collection.id,
		disabled: isMobile,
		data: { kind: 'inbox', collectionId: collection.id },
	});

	return (
		<div ref={setNodeRef}>
			<Link
				route="collection.show"
				routeParams={{ id: collection.id }}
				preserveScroll
				className={clsx(
					'flex items-center gap-3 px-4 py-2 rounded-md transition-colors',
					'hover:bg-white/50 dark:hover:bg-gray-800/50',
					'text-gray-700 dark:text-gray-300',
					isActive &&
						'bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
				)}
				title={collection.name}
			>
				<div className="w-5 h-5 flex-shrink-0 i-ant-design-inbox-outlined" />
				<span className="truncate flex-1">{collection.name}</span>
			</Link>
		</div>
	);
}
