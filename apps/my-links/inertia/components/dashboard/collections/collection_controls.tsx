import { Collection, CollectionWithLinks } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { forwardRef, MouseEvent, useImperativeHandle } from 'react';
import { ContextMenu } from '~/components/common/context_menu/context_menu';
import { ContextMenuItem } from '~/components/common/context_menu/context_menu_item';
import { IconButton } from '@minimalstuff/ui';
import { useContextMenu } from '~/hooks/use_context_menu';
import { useModalStore } from '~/stores/modal_store';
import { DeleteCollectionModal } from '../modals/delete_collection_modal';
import { EditCollectionModal } from '../modals/edit_collection_modal';

export interface CollectionControlsRef {
	openContextMenu: (x: number, y: number) => void;
}

interface CollectionControlsProps {
	collection: Collection;
}

interface PagePropsWithActiveCollection extends PageProps {
	activeCollection?: CollectionWithLinks | null;
}

export const CollectionControls = forwardRef<
	CollectionControlsRef,
	CollectionControlsProps
>(({ collection }, ref) => {
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
		openMenu,
		closeMenu,
		toggleMenu,
		handleContextMenu,
	} = useContextMenu();

	const handleEditCollection = () => {
		closeMenu();
		openModal({
			title: <Trans>Edit a collection</Trans>,
			children: (
				<EditCollectionModal collection={collection} onClose={closeAll} />
			),
		});
	};

	const handleDeleteCollection = () => {
		closeMenu();
		openModal({
			title: <Trans>Delete a collection</Trans>,
			children: (
				<DeleteCollectionModal collection={collection} onClose={closeAll} />
			),
		});
	};

	const handleStopPropagation = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	useImperativeHandle(ref, () => ({
		openContextMenu: (x: number, y: number) => {
			openMenu({ x, y });
		},
	}));

	if (!isOwner) {
		return null;
	}

	return (
		<div
			className="relative"
			ref={menuRef}
			onClick={(e) => e.stopPropagation()}
		>
			<IconButton
				icon="i-mdi-dots-vertical"
				size="sm"
				onClick={(e) => {
					handleStopPropagation(e);
					toggleMenu(e);
				}}
				onContextMenu={handleContextMenu}
				aria-label="Menu"
				className="opacity-0 group-hover:opacity-100 transition-opacity"
			/>

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
});
