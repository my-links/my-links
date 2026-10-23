import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Modal } from '@minimalstuff/ui';
import {
	useCallback,
	useState,
	type MouseEvent as ReactMouseEvent,
} from 'react';

import { DeleteLinkModal } from '~/components/dashboard/modals/delete_link_modal';
import { EditLinkModal } from '~/components/dashboard/modals/edit_link_modal';
import { hasCollectionIds, type DisplayLink } from '~/lib/link';
import { urlFor } from '~/lib/tuyau';

type MenuClickHandler = (event: ReactMouseEvent<HTMLButtonElement>) => void;

export type LinkActions = {
	isRefreshingFavicon: boolean;
	handleEditLink: MenuClickHandler;
	handleDeleteLink: MenuClickHandler;
	handleFavorite: MenuClickHandler;
	handleRefreshFavicon: MenuClickHandler;
	handleGoToCollection: (collectionId: number) => MenuClickHandler;
};

export function useLinkActions(
	link: DisplayLink,
	onAction?: () => void,
	onFaviconRefreshed?: () => void
): LinkActions {
	const [isRefreshingFavicon, setIsRefreshingFavicon] = useState(false);

	const linkWithCollections = hasCollectionIds(link) ? link : null;

	const handleEditLink: MenuClickHandler = (event) => {
		event.stopPropagation();
		if (!linkWithCollections) return;
		onAction?.();
		const handleClose = () => Modal.end(call, undefined);
		const call = Modal.call({
			title: <Trans>Edit a link</Trans>,
			children: (
				<EditLinkModal link={linkWithCollections} onClose={handleClose} />
			),
		});
	};

	const handleDeleteLink: MenuClickHandler = (event) => {
		event.stopPropagation();
		if (!linkWithCollections) return;
		onAction?.();
		const handleClose = () => Modal.end(call, undefined);
		const call = Modal.call({
			title: <Trans>Delete a link</Trans>,
			children: (
				<DeleteLinkModal link={linkWithCollections} onClose={handleClose} />
			),
		});
	};

	const isFavorite = 'favorite' in link ? link.favorite : false;

	const handleFavorite = useCallback<MenuClickHandler>(
		(event) => {
			event.stopPropagation();
			const toggleFavoriteUrl = urlFor('link.toggle-favorite', {
				id: link.id,
			});
			router.put(toggleFavoriteUrl, { favorite: !isFavorite });
			onAction?.();
		},
		[link.id, isFavorite, onAction]
	);

	const handleRefreshFavicon = useCallback<MenuClickHandler>(
		(event) => {
			event.stopPropagation();
			if (isRefreshingFavicon) return;

			setIsRefreshingFavicon(true);
			const refreshFaviconUrl = urlFor('link.refresh-favicon', { id: link.id });
			router.post(
				refreshFaviconUrl,
				{},
				{
					preserveScroll: true,
					onSuccess: () => onFaviconRefreshed?.(),
					onFinish: () => setIsRefreshingFavicon(false),
				}
			);
			onAction?.();
		},
		[link.id, onAction, onFaviconRefreshed, isRefreshingFavicon]
	);

	const handleGoToCollection =
		(collectionId: number): MenuClickHandler =>
		(event) => {
			event.stopPropagation();
			onAction?.();
			router.visit(urlFor('collection.show', { id: collectionId }));
		};

	return {
		isRefreshingFavicon,
		handleEditLink,
		handleDeleteLink,
		handleFavorite,
		handleRefreshFavicon,
		handleGoToCollection,
	};
}
