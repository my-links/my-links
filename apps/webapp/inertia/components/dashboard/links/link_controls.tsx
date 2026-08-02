import { router } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { IconButton, Modal } from '@minimalstuff/ui';
import { Link as InertiaLink } from '@adonisjs/inertia/react';
import { MouseEvent, useCallback, useImperativeHandle, useMemo } from 'react';

import { urlFor } from '~/lib/tuyau';
import { hasCollectionIds } from '~/lib/link';
import { useContextMenu } from '~/hooks/use_context_menu';
import { EditLinkModal } from '../modals/edit_link_modal';
import { DeleteLinkModal } from '../modals/delete_link_modal';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { ContextMenu } from '~/components/common/context_menu/context_menu';
import { ContextMenuItem } from '~/components/common/context_menu/context_menu_item';

type Link = Data.Link;
type LinkWithCollections = Data.Link.Variants['withCollections'];

export interface LinkControlsRef {
	openContextMenu: (x: number, y: number) => void;
}

interface LinkControlsProps {
	ref: React.RefObject<LinkControlsRef | null>;
	link: Link;
}

export function LinkControls({ link, ref }: Readonly<LinkControlsProps>) {
	const { activeCollection, myCollections } = useDashboardProps();

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

	const linkWithCollections: LinkWithCollections | null = hasCollectionIds(link)
		? link
		: null;

	const linkCollections = useMemo(() => {
		if (!linkWithCollections) return [];
		return myCollections.filter((collection) =>
			linkWithCollections.collectionIds.includes(collection.id)
		);
	}, [linkWithCollections, myCollections]);

	const handleEditLink = () => {
		closeMenu();
		if (!linkWithCollections) return;
		const call = Modal.call({
			title: <Trans>Edit a link</Trans>,
			children: (
				<EditLinkModal
					link={linkWithCollections}
					onClose={() => Modal.end(call, undefined)}
				/>
			),
		});
	};

	const handleDeleteLink = () => {
		closeMenu();
		if (!linkWithCollections) return;
		const call = Modal.call({
			title: <Trans>Delete a link</Trans>,
			children: (
				<DeleteLinkModal
					link={linkWithCollections}
					onClose={() => Modal.end(call, undefined)}
				/>
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
				{!activeCollection &&
					linkCollections.map((collection) => (
						<InertiaLink
							key={collection.id}
							route="collection.show"
							routeParams={{ id: collection.id }}
							className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							onClick={(e) => {
								e.stopPropagation();
								closeMenu();
							}}
						>
							<div className="i-fa6-regular-eye w-4 h-4" />
							<Trans>Go to {collection.name}</Trans>
						</InertiaLink>
					))}
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
				<ContextMenuItem
					icon="i-mdi-content-copy"
					onClick={() => void handleCopyLink()}
				>
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
