import { Link as InertiaLink } from '@adonisjs/inertia/react';
import type { Data } from '@generated/data';
import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { IconButton } from '@minimalstuff/ui';
import { MouseEvent, useCallback, useImperativeHandle, useMemo } from 'react';
import { ContextMenu } from '~/components/common/context_menu/context_menu';
import { ContextMenuItem } from '~/components/common/context_menu/context_menu_item';
import { useContextMenu } from '~/hooks/use_context_menu';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { urlFor } from '~/lib/tuyau';
import { useModalStore } from '~/stores/modal_store';
import { DeleteLinkModal } from '../modals/delete_link_modal';
import { EditLinkModal } from '../modals/edit_link_modal';

type Link = Data.Link;
type LinkWithCollection = Data.Link.Variants['withCollection'];

export interface LinkControlsRef {
	openContextMenu: (x: number, y: number) => void;
}

interface LinkControlsProps {
	ref: React.RefObject<LinkControlsRef | null>;
	link: Link;
}

export function LinkControls({ link, ref }: Readonly<LinkControlsProps>) {
	const { activeCollection, myCollections } = useDashboardProps();
	const openModal = useModalStore((state) => state.open);
	const closeAll = useModalStore((state) => state.closeAll);

	const isOwner = activeCollection?.isOwner !== false;

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
		if (!activeCollection) {
			const collection = myCollections.find((c) => c.id === link.collectionId);
			if (collection) {
				return {
					...link,
					collection,
				} satisfies LinkWithCollection;
			}
			return null;
		}

		return {
			...link,
			collection: activeCollection,
		} satisfies LinkWithCollection;
	}, [link, activeCollection, myCollections]);

	const handleEditLink = () => {
		closeMenu();
		if (!linkWithCollection) return;
		openModal({
			title: <Trans>Edit a link</Trans>,
			children: <EditLinkModal link={linkWithCollection} onClose={closeAll} />,
		});
	};

	const handleDeleteLink = () => {
		closeMenu();
		if (!linkWithCollection) return;
		openModal({
			title: <Trans>Delete a link</Trans>,
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
		const toggleFavoriteUrl = urlFor('link.toggle-favorite', {
			id: link.id,
		});
		router.put(toggleFavoriteUrl, { favorite: !link.favorite });
	}, [link.id, link.favorite]);

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
			aria-hidden="true"
		>
			<IconButton
				icon="i-mdi-dots-vertical"
				onClick={(e) => {
					handleStopPropagation(e);
					toggleMenu(e);
				}}
				onContextMenu={handleContextMenu}
				aria-label="Menu"
			/>

			<ContextMenu
				isVisible={isVisible}
				shouldRender={shouldRender}
				menuPosition={menuPosition}
				menuContentRef={menuContentRef}
			>
				{!activeCollection && (
					<InertiaLink
						route="collection.show"
						routeParams={{ id: link.collectionId }}
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
