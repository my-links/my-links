import { Collection, CollectionWithLinks } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { Trans as TransComponent } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { usePage } from '@inertiajs/react';
import { MouseEvent } from 'react';
import { ContextMenu } from '~/components/common/context_menu/context_menu';
import { ContextMenuItem } from '~/components/common/context_menu/context_menu_item';
import { useContextMenu } from '~/hooks/use_context_menu';
import { useModalStore } from '~/stores/modal_store';
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
	const openModal = useModalStore((state) => state.open);
	const closeAll = useModalStore((state) => state.closeAll);

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
		openModal({
			title: (
				<TransComponent
					id="common:collection.edit"
					message="Edit a collection"
				/>
			),
			children: (
				<EditCollectionModal collection={collection} onClose={closeAll} />
			),
		});
	};

	const handleDeleteCollection = () => {
		closeMenu();
		openModal({
			title: (
				<TransComponent
					id="common:collection.delete"
					message="Delete a collection"
				/>
			),
			children: (
				<DeleteCollectionModal collection={collection} onClose={closeAll} />
			),
		});
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
		</div>
	);
}
