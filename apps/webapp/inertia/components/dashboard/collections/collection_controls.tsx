import { usePage } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { PageProps } from '@adonisjs/inertia/types';
import { ContextMenu, IconButton, MenuItem, Modal } from '@minimalstuff/ui';
import {
	forwardRef,
	useImperativeHandle,
	useRef,
	type MouseEvent as ReactMouseEvent,
} from 'react';

import { cn } from '~/lib/cn';
import { CreateLinkModal } from '../modals/create_link_modal';
import { EditCollectionModal } from '../modals/edit_collection_modal';
import { DeleteCollectionModal } from '../modals/delete_collection_modal';

type Collection = Data.Collection;
type CollectionWithLinks = Data.Collection.Variants['withLinks'];

export interface CollectionControlsRef {
	openContextMenu: (x: number, y: number) => void;
}

interface CollectionControlsProps {
	collection: Collection;
	/**
	 * Drops the hover buttons, which a collapsed rail has no room for, and
	 * keeps the right-click menu. Leaving the component mounted is what makes
	 * that menu reachable at all: the row opens it through this ref.
	 */
	showQuickActions?: boolean;
}

interface PagePropsWithActiveCollection extends PageProps {
	activeCollection?: CollectionWithLinks | null;
}

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

	const handleCreateLink = (e: ReactMouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
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

	const handleEditCollection = (e: ReactMouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
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

	const handleDeleteCollection = (e: ReactMouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
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

	useImperativeHandle(ref, () => ({
		openContextMenu: (x: number, y: number) => {
			menuRef.current?.dispatchEvent(
				new MouseEvent('contextmenu', {
					bubbles: true,
					cancelable: true,
					clientX: x,
					clientY: y,
				})
			);
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
				<>
					<MenuItem
						icon="i-ant-design-plus-outlined"
						onClick={handleCreateLink}
					>
						<Trans>Add link</Trans>
					</MenuItem>
					{!collection.isDefault && (
						<>
							<MenuItem icon="i-octicon-pencil" onClick={handleEditCollection}>
								<Trans>Edit collection</Trans>
							</MenuItem>
							<MenuItem
								icon="i-ion-trash-outline"
								onClick={handleDeleteCollection}
								danger
							>
								<Trans>Delete collection</Trans>
							</MenuItem>
						</>
					)}
				</>
			}
		>
			{/* Nothing at all rather than an empty wrapper: the row is a centred
			flex box, and a zero-width child still eats a `gap` and shifts the
			icon off centre in the rail. */}
			{showQuickActions && (
				<div
					className={cn(
						'pointer-events-none absolute inset-y-0 right-0 flex items-center gap-0.5 py-1 pl-8 pr-2',
						'bg-gradient-to-l from-gray-50 via-gray-50/90 to-transparent dark:from-gray-900 dark:via-gray-900/90',
						'opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto'
					)}
					onClick={(e) => e.stopPropagation()}
				>
					<IconButton
						icon="i-ant-design-plus-outlined"
						size="sm"
						onClick={handleCreateLink}
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
								e.stopPropagation();
								menuRef.current?.dispatchEvent(
									new MouseEvent('contextmenu', {
										bubbles: true,
										cancelable: true,
										clientX: e.clientX,
										clientY: e.clientY,
									})
								);
							}}
							aria-label="Menu"
						/>
					)}
				</div>
			)}
		</ContextMenu>
	);
});
