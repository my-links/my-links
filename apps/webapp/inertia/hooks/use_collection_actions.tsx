import { Modal } from '@minimalstuff/ui';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { CreateLinkModal } from '~/components/dashboard/modals/create_link_modal';
import { EditCollectionModal } from '~/components/dashboard/modals/edit_collection_modal';
import { DeleteCollectionModal } from '~/components/dashboard/modals/delete_collection_modal';

type MenuClickHandler = (event: ReactMouseEvent<HTMLButtonElement>) => void;

type UseCollectionActionsReturn = {
	handleCreateLink: MenuClickHandler;
	handleEditCollection: MenuClickHandler;
	handleDeleteCollection: MenuClickHandler;
};

export function useCollectionActions(
	collection: Data.Collection
): UseCollectionActionsReturn {
	const handleCreateLink: MenuClickHandler = (event) => {
		// Row is an anchor: without preventDefault the browser follows its href.
		event.preventDefault();
		event.stopPropagation();
		const handleClose = () => Modal.end(call, undefined);
		const call = Modal.call({
			title: <Trans>Create a link</Trans>,
			children: (
				<CreateLinkModal
					collectionId={collection.isDefault ? undefined : collection.id}
					onClose={handleClose}
				/>
			),
		});
	};

	const handleEditCollection: MenuClickHandler = (event) => {
		event.stopPropagation();
		const handleClose = () => Modal.end(call, undefined);
		const call = Modal.call({
			title: <Trans>Edit a collection</Trans>,
			children: (
				<EditCollectionModal collection={collection} onClose={handleClose} />
			),
		});
	};

	const handleDeleteCollection: MenuClickHandler = (event) => {
		event.stopPropagation();
		const handleClose = () => Modal.end(call, undefined);
		const call = Modal.call({
			title: <Trans>Delete a collection</Trans>,
			children: (
				<DeleteCollectionModal collection={collection} onClose={handleClose} />
			),
		});
	};

	return { handleCreateLink, handleEditCollection, handleDeleteCollection };
}
