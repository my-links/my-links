import {
	CollectionWithLinks,
	Link,
	LinkWithCollection,
} from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { router, usePage } from '@inertiajs/react';
import { Trans as TransComponent } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { Link as InertiaLink } from '@tuyau/inertia/react';
import { MouseEvent, useCallback, useImperativeHandle, useMemo } from 'react';
import { ContextMenu } from '~/components/common/context_menu/context_menu';
import { ContextMenuItem } from '~/components/common/context_menu/context_menu_item';
import { useContextMenu } from '~/hooks/use_context_menu';
import { useRouteHelper } from '~/lib/route_helper';
import { useModalStore } from '~/stores/modal_store';
import { DeleteLinkModal } from '../modals/delete_link_modal';
import { EditLinkModal } from '../modals/edit_link_modal';

export interface LinkControlsRef {
	openContextMenu: (x: number, y: number) => void;
}

interface PagePropsWithCollections extends PageProps {
	activeCollection?: CollectionWithLinks | null;
	collections: CollectionWithLinks[];
}

interface LinkControlsProps {
	link: Link;
}

export function LinkControls({
	link,
	ref,
}: LinkControlsProps & { ref: React.RefObject<LinkControlsRef | null> }) {
	const { activeCollection, collections } =
		usePage<PagePropsWithCollections>().props;
	const openModal = useModalStore((state) => state.open);
	const closeAll = useModalStore((state) => state.closeAll);

	const isOwner = activeCollection?.isOwner !== false;

	const { url } = useRouteHelper();

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

	const linkWithCollection: LinkWithCollection | null = useMemo(() => {
		if (!activeCollection) return null;
		return {
			...link,
			collection: activeCollection,
		} satisfies LinkWithCollection;
	}, [link, activeCollection]);

	const handleEditLink = () => {
		closeMenu();
		if (!linkWithCollection) return;
		openModal({
			title: <TransComponent id="common:link.edit" message="Edit a link" />,
			children: (
				<EditLinkModal
					collections={collections}
					link={linkWithCollection}
					onClose={closeAll}
				/>
			),
		});
	};

	const handleDeleteLink = () => {
		closeMenu();
		if (!linkWithCollection) return;
		openModal({
			title: <TransComponent id="common:link.delete" message="Delete a link" />,
			children: (
				<DeleteLinkModal link={linkWithCollection} onClose={closeAll} />
			),
		});
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(link.url);
			closeMenu();
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
	};

	const handleFavorite = useCallback(() => {
		const toggleFavoriteUrl = url('link.toggle-favorite', {
			params: { id: link.id.toString() },
		});
		router.put(toggleFavoriteUrl, {
			favorite: !link.favorite,
		});
	}, [link.id]);

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
					toggleMenu(e);
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
			>
				{!activeCollection && (
					<InertiaLink
						route="collection.show"
						params={{ id: link.collectionId }}
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
				{isOwner && (
					<>
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
					</>
				)}
			</ContextMenu>
		</div>
	);
}
