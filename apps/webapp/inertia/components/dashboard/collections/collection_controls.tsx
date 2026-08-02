import { usePage } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { PageProps } from '@adonisjs/inertia/types';
import { IconButton, Modal } from '@minimalstuff/ui';
import { forwardRef, MouseEvent, useImperativeHandle } from 'react';

import { useContextMenu } from '~/hooks/use_context_menu';
import { EditCollectionModal } from '../modals/edit_collection_modal';
import { DeleteCollectionModal } from '../modals/delete_collection_modal';
import { ContextMenu } from '~/components/common/context_menu/context_menu';
import { ContextMenuItem } from '~/components/common/context_menu/context_menu_item';

type Collection = Data.Collection;
type CollectionWithLinks = Data.Collection.Variants['withLinks'];

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
		const call = Modal.call({
			title: <Trans>Edit a collection</Trans>,
			children: (
				<EditCollectionModal
					collection={collection}
					onClose={() => Modal.end(call, undefined)}
				/>
			),
		});
	};

	const handleDeleteCollection = () => {
		closeMenu();
		const call = Modal.call({
			title: <Trans>Delete a collection</Trans>,
			children: (
				<DeleteCollectionModal
					collection={collection}
					onClose={() => Modal.end(call, undefined)}
				/>
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

	// The default (Inbox) collection can't be edited or renamed and is
	// delete-guarded server-side — so it carries no controls at all.
	if (!isOwner || collection.isDefault) {
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
