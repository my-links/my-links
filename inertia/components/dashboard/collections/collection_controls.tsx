import { Collection, CollectionWithLinks } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { Trans as TransComponent } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { usePage } from '@inertiajs/react';
import { MouseEvent, useState } from 'react';
import { ContextMenu } from '~/components/common/context_menu/context_menu';
import { ContextMenuItem } from '~/components/common/context_menu/context_menu_item';
import { Modal } from '~/components/common/modal';
import { useContextMenu } from '~/hooks/use_context_menu';
import { DeleteCollectionModal } from '../modals/delete_collection_modal';
import { EditCollectionModal } from '../modals/edit_collection_modal';

interface CollectionControlsProps {
	collection: Collection;
}

interface PagePropsWithActiveCollection extends PageProps {
	activeCollection?: CollectionWithLinks | null;
}

export function CollectionControls({ collection }: CollectionControlsProps) {
	const { props } = usePage<PagePropsWithActiveCollection>();
	const activeCollection = props.activeCollection;
	const isOwner =
		!activeCollection ||
		activeCollection.id !== collection.id ||
		activeCollection.isOwner !== false;
	const [editCollectionOpen, setEditCollectionOpen] = useState(false);
	const [deleteCollectionOpen, setDeleteCollectionOpen] = useState(false);

	const {
		menuPosition,
		shouldRender,
		isVisible,
		menuRef,
		menuContentRef,
		closeMenu,
		toggleMenu,
		handleContextMenu,
	} = useContextMenu();

	const handleEditCollection = () => {
		closeMenu();
		setEditCollectionOpen(true);
	};

	const handleDeleteCollection = () => {
		closeMenu();
		setDeleteCollectionOpen(true);
	};

	const handleStopPropagation = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	if (!isOwner) {
		return null;
	}

	return (
		<div
			className="relative"
			ref={menuRef}
			onClick={(e) => e.stopPropagation()}
		>
			<button
				onClick={(e) => {
					handleStopPropagation(e);
					toggleMenu(e);
				}}
				onContextMenu={handleContextMenu}
				className="p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
				aria-label="Menu"
			>
				<div className="i-mdi-dots-vertical w-5 h-5" />
			</button>

			<ContextMenu
				isVisible={isVisible}
				shouldRender={shouldRender}
				menuPosition={menuPosition}
				menuContentRef={menuContentRef}
			>
				<ContextMenuItem icon="i-octicon-pencil" onClick={handleEditCollection}>
					<Trans>Edit collection</Trans>
				</ContextMenuItem>
				<ContextMenuItem
					icon="i-ion-trash-outline"
					onClick={handleDeleteCollection}
					variant="danger"
				>
					<Trans>Delete collection</Trans>
				</ContextMenuItem>
			</ContextMenu>

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
					collection={collection}
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
					collection={collection}
					onClose={() => setDeleteCollectionOpen(false)}
				/>
			</Modal>
		</div>
	);
}
