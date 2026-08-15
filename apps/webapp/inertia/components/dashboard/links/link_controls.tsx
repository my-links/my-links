import { router } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import {
	ContextMenu,
	CopyButton,
	IconButton,
	MenuItem,
	Modal,
} from '@minimalstuff/ui';
import {
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	type MouseEvent as ReactMouseEvent,
} from 'react';

import { urlFor } from '~/lib/tuyau';
import { hasCollectionIds } from '~/lib/link';
import { EditLinkModal } from '../modals/edit_link_modal';
import { DeleteLinkModal } from '../modals/delete_link_modal';
import { useDashboardProps } from '~/hooks/use_dashboard_props';

type Link = Data.Link;
type LinkWithCollections = Data.Link.Variants['withCollections'];

export interface LinkControlsRef {
	openContextMenu: (x: number, y: number) => void;
}

interface LinkControlsProps {
	ref: React.RefObject<LinkControlsRef | null>;
	link: Link;
	/** Notified after a menu item runs its action — lets a host like the search modal close itself. */
	onAction?: () => void;
}

const dispatchContextMenuAt = (
	target: HTMLDivElement | null,
	x: number,
	y: number
) => {
	target?.dispatchEvent(
		new MouseEvent('contextmenu', {
			bubbles: true,
			cancelable: true,
			clientX: x,
			clientY: y,
		})
	);
};

export function LinkControls({
	link,
	ref,
	onAction,
}: Readonly<LinkControlsProps>) {
	const { activeCollection, myCollections } = useDashboardProps();

	const isOwner = activeCollection?.isOwner !== false;

	const menuRef = useRef<HTMLDivElement>(null);

	const linkWithCollections: LinkWithCollections | null = hasCollectionIds(link)
		? link
		: null;

	// Excludes the collection the user is already looking at — "go to the
	// collection you're viewing" is redundant there, but a link can belong to
	// other collections too (e.g. from a cross-collection view like search).
	const linkCollections = useMemo(() => {
		if (!linkWithCollections) return [];
		return myCollections.filter(
			(collection) =>
				linkWithCollections.collectionIds.includes(collection.id) &&
				collection.id !== activeCollection?.id
		);
	}, [linkWithCollections, myCollections, activeCollection]);

	const handleEditLink = (e: ReactMouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		if (!linkWithCollections) return;
		onAction?.();
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

	const handleDeleteLink = (e: ReactMouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		if (!linkWithCollections) return;
		onAction?.();
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

	const handleFavorite = useCallback(
		(e: ReactMouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			const toggleFavoriteUrl = urlFor('link.toggle-favorite', {
				id: link.id,
			});
			router.put(toggleFavoriteUrl, { favorite: !link.favorite });
			onAction?.();
		},
		[link.id, link.favorite, onAction]
	);

	const handleGoToCollection = (
		collectionId: number,
		e: ReactMouseEvent<HTMLButtonElement>
	) => {
		e.stopPropagation();
		onAction?.();
		router.visit(urlFor('collection.show', { id: collectionId }));
	};

	useImperativeHandle(ref, () => ({
		openContextMenu: (x: number, y: number) => {
			dispatchContextMenuAt(menuRef.current, x, y);
		},
	}));

	return (
		<CopyButton value={link.url}>
			{({ copy }) => (
				<ContextMenu
					ref={menuRef}
					className="relative"
					items={
						<>
							{linkCollections.map((collection) => (
								<MenuItem
									key={collection.id}
									icon="i-fa6-regular-eye"
									onClick={(e) => handleGoToCollection(collection.id, e)}
								>
									<Trans>Go to {collection.name}</Trans>
								</MenuItem>
							))}
							{'favorite' in link && (
								<MenuItem
									icon={
										link.favorite ? 'i-mdi-favorite' : 'i-mdi-favorite-border'
									}
									onClick={handleFavorite}
								>
									{link.favorite ? (
										<Trans>Remove from favorites</Trans>
									) : (
										<Trans>Add to favorites</Trans>
									)}
								</MenuItem>
							)}
							<MenuItem
								icon="i-mdi-content-copy"
								onClick={(e) => {
									e.stopPropagation();
									void copy();
									onAction?.();
								}}
							>
								<Trans>Copy link</Trans>
							</MenuItem>
							{isOwner && (
								<>
									<MenuItem icon="i-octicon-pencil" onClick={handleEditLink}>
										<Trans>Edit a link</Trans>
									</MenuItem>
									<MenuItem
										icon="i-ion-trash-outline"
										onClick={handleDeleteLink}
										danger
									>
										<Trans>Delete a link</Trans>
									</MenuItem>
								</>
							)}
						</>
					}
				>
					<IconButton
						icon="i-mdi-dots-vertical"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							dispatchContextMenuAt(menuRef.current, e.clientX, e.clientY);
						}}
						aria-label="Menu"
					/>
				</ContextMenu>
			)}
		</CopyButton>
	);
}
