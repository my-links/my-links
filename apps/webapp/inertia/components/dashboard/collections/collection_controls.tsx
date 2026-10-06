import { usePage } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { ContextMenu } from '@minimalstuff/ui';
import { PageProps } from '@adonisjs/inertia/types';
import {
	forwardRef,
	useImperativeHandle,
	useRef,
	type MouseEvent as ReactMouseEvent,
} from 'react';

import { dispatchContextMenuAt } from '~/lib/dispatch_context_menu';
import { useCollectionActions } from '~/hooks/use_collection_actions';
import { CollectionMenuItems } from '~/components/dashboard/collections/collection_menu_items';
import { CollectionQuickActions } from '~/components/dashboard/collections/collection_quick_actions';

type Collection = Data.Collection;
type CollectionWithLinks = Data.Collection.Variants['withLinks'];

export type CollectionControlsRef = {
	openContextMenu: (x: number, y: number) => void;
};

type CollectionControlsProps = {
	collection: Collection;
	/**
	 * Drops the hover buttons, which a collapsed rail has no room for, and
	 * keeps the right-click menu. Leaving the component mounted is what makes
	 * that menu reachable at all: the row opens it through this ref.
	 */
	showQuickActions?: boolean;
};

type PagePropsWithActiveCollection = PageProps & {
	activeCollection?: CollectionWithLinks | null;
};

export const CollectionControls = forwardRef<
	CollectionControlsRef,
	Readonly<CollectionControlsProps>
>(({ collection, showQuickActions = true }, ref) => {
	const { props } = usePage<PagePropsWithActiveCollection>();
	const activeCollection = props.activeCollection;
	const isOwner =
		!activeCollection ||
		activeCollection.id !== collection.id ||
		activeCollection.isOwner !== false;

	const menuRef = useRef<HTMLDivElement>(null);

	const { handleCreateLink, handleEditCollection, handleDeleteCollection } =
		useCollectionActions(collection);

	const handleOpenMenu = (event: ReactMouseEvent<HTMLButtonElement>) => {
		// The row is a Link (an anchor); without preventDefault the browser still follows its href on this click.
		event.preventDefault();
		event.stopPropagation();
		dispatchContextMenuAt(menuRef.current, event.clientX, event.clientY);
	};

	useImperativeHandle(ref, () => ({
		openContextMenu: (x: number, y: number) => {
			dispatchContextMenuAt(menuRef.current, x, y);
		},
	}));

	if (!isOwner) {
		return null;
	}

	return (
		<ContextMenu
			ref={menuRef}
			// contents: an empty box here eats a `gap-3` slot next to the icon in rail mode.
			className="contents"
			items={
				<CollectionMenuItems
					collection={collection}
					onCreateLink={handleCreateLink}
					onEditCollection={handleEditCollection}
					onDeleteCollection={handleDeleteCollection}
				/>
			}
		>
			{/* Nothing at all rather than an empty wrapper: the row is a centred
			flex box, and a zero-width child still eats a `gap` and shifts the
			icon off centre in the rail. */}
			{showQuickActions && (
				<CollectionQuickActions
					collection={collection}
					onCreateLink={handleCreateLink}
					onOpenMenu={handleOpenMenu}
				/>
			)}
		</ContextMenu>
	);
});
