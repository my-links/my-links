import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { MenuItem } from '@minimalstuff/ui';
import type { MouseEvent as ReactMouseEvent } from 'react';

import type { LinkActions } from '~/hooks/use_link_actions';

type LinkMenuItemsProps = {
	link: Data.Link;
	linkCollections: Data.Collection[];
	isOwner: boolean;
	actions: LinkActions;
	onCopy: () => void;
};

export function LinkMenuItems({
	link,
	linkCollections,
	isOwner,
	actions,
	onCopy,
}: Readonly<LinkMenuItemsProps>) {
	const handleCopy = (event: ReactMouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		onCopy();
	};

	return (
		<>
			{linkCollections.map((collection) => (
				<MenuItem
					key={collection.id}
					icon="i-fa6-regular-eye"
					onClick={actions.handleGoToCollection(collection.id)}
				>
					<Trans>Go to {collection.name}</Trans>
				</MenuItem>
			))}
			{'favorite' in link && (
				<MenuItem
					icon={link.favorite ? 'i-mdi-favorite' : 'i-mdi-favorite-border'}
					onClick={actions.handleFavorite}
				>
					{link.favorite ? (
						<Trans>Remove from favorites</Trans>
					) : (
						<Trans>Add to favorites</Trans>
					)}
				</MenuItem>
			)}
			<MenuItem icon="i-mdi-content-copy" onClick={handleCopy}>
				<Trans>Copy link</Trans>
			</MenuItem>
			{isOwner && (
				<>
					<MenuItem icon="i-octicon-pencil" onClick={actions.handleEditLink}>
						<Trans>Edit a link</Trans>
					</MenuItem>
					<MenuItem
						icon="i-mdi-refresh"
						onClick={actions.handleRefreshFavicon}
						disabled={actions.isRefreshingFavicon}
					>
						<Trans>Refresh favicon</Trans>
					</MenuItem>
					<MenuItem
						icon="i-ion-trash-outline"
						onClick={actions.handleDeleteLink}
						danger
					>
						<Trans>Delete a link</Trans>
					</MenuItem>
				</>
			)}
		</>
	);
}
