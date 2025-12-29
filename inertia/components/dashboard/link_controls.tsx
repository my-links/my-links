import {
	CollectionWithLinks,
	Link,
	LinkWithCollection,
} from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { Link as InertiaLink, usePage } from '@inertiajs/react';
import { Trans as TransComponent } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import {
	forwardRef,
	MouseEvent,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import { ContextMenu } from '~/components/common/context_menu';
import { ContextMenuItem } from '~/components/common/context_menu_item';
import { Modal } from '~/components/common/modal';
import { useContextMenu } from '~/hooks/use_context_menu';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import { onFavorite } from '~/lib/favorite';
import { appendCollectionId } from '~/lib/navigation';
import { DeleteLinkModal } from './modals/delete_link_modal';
import { EditLinkModal } from './modals/edit_link_modal';

interface LinkControlsProps {
	link: Link;
	showGoToCollection?: boolean;
}

export interface LinkControlsRef {
	openContextMenu: (x: number, y: number) => void;
}

interface PagePropsWithCollections extends PageProps {
	collections: CollectionWithLinks[];
	activeCollection?: CollectionWithLinks | null;
}

export const LinkControls = forwardRef<LinkControlsRef, LinkControlsProps>(
	function LinkControls({ link, showGoToCollection = false }, ref) {
		const { props } = usePage<PagePropsWithCollections>();
		const tuyau = useTuyauRequired();
		const [editLinkOpen, setEditLinkOpen] = useState(false);
		const [deleteLinkOpen, setDeleteLinkOpen] = useState(false);

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

		const linkWithCollection = useMemo((): LinkWithCollection | null => {
			const collection = props.collections.find(
				(c) => c.id === link.collectionId
			);
			if (!collection) return null;
			return {
				...link,
				collection: {
					id: collection.id,
					name: collection.name,
					description: collection.description,
					visibility: collection.visibility,
					authorId: collection.authorId,
					createdAt: collection.createdAt,
					updatedAt: collection.updatedAt,
				},
			};
		}, [link, props.collections]);

		const handleEditLink = () => {
			closeMenu();
			setEditLinkOpen(true);
		};

		const handleDeleteLink = () => {
			closeMenu();
			setDeleteLinkOpen(true);
		};

		const handleCopyLink = async () => {
			try {
				await navigator.clipboard.writeText(link.url);
				closeMenu();
			} catch (err) {
				console.error('Failed to copy link:', err);
			}
		};

		const handleFavorite = () => {
			onFavorite(tuyau, link.id, !link.favorite, () => {
				closeMenu();
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

		return (
			<div
				className="relative"
				ref={menuRef}
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={(e) => {
						handleStopPropagation(e);
						toggleMenu();
					}}
					onContextMenu={handleContextMenu}
					className="p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
					aria-label="Menu"
				>
					<div className="i-mdi-dots-vertical w-5 h-5" />
				</button>

				<ContextMenu
					isVisible={isVisible}
					shouldRender={shouldRender}
					menuPosition={menuPosition}
					menuContentRef={menuContentRef}
					onBackdropClick={closeMenu}
				>
					{showGoToCollection && (
						<InertiaLink
							href={appendCollectionId(
								tuyau.$route('collection.show').path,
								link.collectionId
							)}
							className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							onClick={(e) => {
								e.stopPropagation();
								closeMenu();
							}}
						>
							<div className="i-fa6-regular-eye w-4 h-4" />
							<Trans>Go to collection</Trans>
						</InertiaLink>
					)}
					{'favorite' in link && (
						<ContextMenuItem
							icon={link.favorite ? 'i-mdi-favorite' : 'i-mdi-favorite-border'}
							onClick={handleFavorite}
						>
							{link.favorite ? (
								<Trans>Remove from favorites</Trans>
							) : (
								<Trans>Add to favorites</Trans>
							)}
						</ContextMenuItem>
					)}
					<ContextMenuItem icon="i-mdi-content-copy" onClick={handleCopyLink}>
						<Trans>Copy link</Trans>
					</ContextMenuItem>
					<ContextMenuItem icon="i-octicon-pencil" onClick={handleEditLink}>
						<Trans>Edit a link</Trans>
					</ContextMenuItem>
					<ContextMenuItem
						icon="i-ion-trash-outline"
						onClick={handleDeleteLink}
						variant="danger"
					>
						<Trans>Delete a link</Trans>
					</ContextMenuItem>
				</ContextMenu>

				{linkWithCollection && (
					<>
						<Modal
							isOpen={editLinkOpen}
							onClose={() => setEditLinkOpen(false)}
							title={
								<TransComponent id="common:link.edit" message="Edit a link" />
							}
						>
							<EditLinkModal
								collections={props.collections}
								link={linkWithCollection}
								onClose={() => setEditLinkOpen(false)}
							/>
						</Modal>

						<Modal
							isOpen={deleteLinkOpen}
							onClose={() => setDeleteLinkOpen(false)}
							title={
								<TransComponent
									id="common:link.delete"
									message="Delete a link"
								/>
							}
						>
							<DeleteLinkModal
								link={linkWithCollection}
								onClose={() => setDeleteLinkOpen(false)}
							/>
						</Modal>
					</>
				)}
			</div>
		);
	}
);
