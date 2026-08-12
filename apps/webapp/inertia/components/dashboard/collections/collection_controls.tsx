import clsx from 'clsx';
import { usePage } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { PageProps } from '@adonisjs/inertia/types';
import { IconButton, Modal } from '@minimalstuff/ui';
import { forwardRef, MouseEvent, useImperativeHandle } from 'react';

import { useContextMenu } from '~/hooks/use_context_menu';
import { CreateLinkModal } from '../modals/create_link_modal';
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
	Readonly<CollectionControlsProps>
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

	const handleCreateLink = () => {
		closeMenu();
		const call = Modal.call({
			title: <Trans>Create a link</Trans>,
			children: (
				<CreateLinkModal
					collectionId={collection.isDefault ? undefined : collection.id}
					onClose={() => Modal.end(call, undefined)}
				/>
			),
		});
	};

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

	if (!isOwner) {
		return null;
	}

	return (
		<div
			className={clsx(
				'pointer-events-none absolute inset-y-0 right-0 flex items-center gap-0.5 py-1 pl-8 pr-2',
				'bg-gradient-to-l from-gray-50 via-gray-50/90 to-transparent dark:from-gray-900 dark:via-gray-900/90',
				'opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto'
			)}
			ref={menuRef}
			onClick={(e) => e.stopPropagation()}
		>
			<IconButton
				icon="i-ant-design-plus-outlined"
				size="sm"
				onClick={(e) => {
					handleStopPropagation(e);
					handleCreateLink();
				}}
				aria-label={`Add link to ${collection.name}`}
			/>

			{/* The default (Inbox) collection can't be edited, renamed, or
			deleted, so it carries no kebab — the context menu still opens
			on right-click, offering only "Add link". */}
			{!collection.isDefault && (
				<IconButton
					icon="i-mdi-dots-vertical"
					size="sm"
					onClick={(e) => {
						handleStopPropagation(e);
						toggleMenu(e);
					}}
					onContextMenu={handleContextMenu}
					aria-label="Menu"
				/>
			)}

			<ContextMenu
				isVisible={isVisible}
				shouldRender={shouldRender}
				menuPosition={menuPosition}
				menuContentRef={menuContentRef}
			>
				<ContextMenuItem
					icon="i-ant-design-plus-outlined"
					onClick={handleCreateLink}
				>
					<Trans>Add link</Trans>
				</ContextMenuItem>
				{!collection.isDefault && (
					<>
						<ContextMenuItem
							icon="i-octicon-pencil"
							onClick={handleEditCollection}
						>
							<Trans>Edit collection</Trans>
						</ContextMenuItem>
						<ContextMenuItem
							icon="i-ion-trash-outline"
							onClick={handleDeleteCollection}
							variant="danger"
						>
							<Trans>Delete collection</Trans>
						</ContextMenuItem>
					</>
				)}
			</ContextMenu>
		</div>
	);
});
