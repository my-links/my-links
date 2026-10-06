import { Modal } from '@minimalstuff/ui';
import { router } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import {
	useCallback,
	useState,
	type MouseEvent as ReactMouseEvent,
} from 'react';

import { urlFor } from '~/lib/tuyau';
import { hasCollectionIds } from '~/lib/link';
import { EditLinkModal } from '~/components/dashboard/modals/edit_link_modal';
import { DeleteLinkModal } from '~/components/dashboard/modals/delete_link_modal';

type MenuClickHandler = (event: ReactMouseEvent<HTMLButtonElement>) => void;

export type LinkActions = {
	isRefreshingFavicon: boolean;
	handleEditLink: MenuClickHandler;
	handleDeleteLink: MenuClickHandler;
	handleFavorite: MenuClickHandler;
	handleRefreshFavicon: MenuClickHandler;
	handleGoToCollection: (
		collectionId: number,
		event: ReactMouseEvent<HTMLButtonElement>
	) => void;
};

export function useLinkActions(
	link: Data.Link,
	onAction?: () => void,
	onFaviconRefreshed?: () => void
): LinkActions {
	const [isRefreshingFavicon, setIsRefreshingFavicon] = useState(false);

	const linkWithCollections = hasCollectionIds(link) ? link : null;

	const handleEditLink: MenuClickHandler = (event) => {
		event.stopPropagation();
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

	const handleDeleteLink: MenuClickHandler = (event) => {
		event.stopPropagation();
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

	const handleFavorite = useCallback<MenuClickHandler>(
		(event) => {
			event.stopPropagation();
			const toggleFavoriteUrl = urlFor('link.toggle-favorite', {
				id: link.id,
			});
			router.put(toggleFavoriteUrl, { favorite: !link.favorite });
			onAction?.();
		},
		[link.id, link.favorite, onAction]
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

	const handleGoToCollection = (
		collectionId: number,
		event: ReactMouseEvent<HTMLButtonElement>
	) => {
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
