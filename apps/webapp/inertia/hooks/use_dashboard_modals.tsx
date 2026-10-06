import { t } from '@lingui/core/macro';
import { Modal } from '@minimalstuff/ui';

import { useShortcut } from '~/hooks/use_shortcut';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { SearchModal } from '~/components/dashboard/modals/search_modal';
import { CreateLinkModal } from '~/components/dashboard/modals/create_link_modal';
import { EditCollectionModal } from '~/components/dashboard/modals/edit_collection_modal';
import { CreateCollectionModal } from '~/components/dashboard/modals/create_collection_modal';
import { DeleteCollectionModal } from '~/components/dashboard/modals/delete_collection_modal';

type UseDashboardModalsReturn = {
	handleCreateCollection: () => void;
	handleEditCollection: () => void;
	handleDeleteCollection: () => void;
	handleCreateLink: () => void;
	handleOpenSearch: () => void;
};

export function useDashboardModals(): UseDashboardModalsReturn {
	const { activeCollection } = useDashboardProps();
	const isMobile = useIsMobile();

	const handleCreateCollection = () => {
		const call = Modal.call({
			title: t`Create a collection`,
			children: (
				<CreateCollectionModal onClose={() => Modal.end(call, undefined)} />
			),
		});
	};

	const handleEditCollection = () => {
		if (
			!activeCollection ||
			activeCollection.isOwner === false ||
			activeCollection.isDefault
		)
			return;
		const call = Modal.call({
			title: t`Edit a collection`,
			children: (
				<EditCollectionModal onClose={() => Modal.end(call, undefined)} />
			),
		});
	};

	const handleDeleteCollection = () => {
		if (
			!activeCollection ||
			activeCollection.isOwner === false ||
			activeCollection.isDefault
		)
			return;
		const call = Modal.call({
			title: t`Delete a collection`,
			children: (
				<DeleteCollectionModal onClose={() => Modal.end(call, undefined)} />
			),
		});
	};

	const handleCreateLink = () => {
		if (activeCollection?.isOwner === false) return;
		const call = Modal.call({
			title: t`Create a link`,
			children: <CreateLinkModal onClose={() => Modal.end(call, undefined)} />,
		});
	};

	const handleOpenSearch = () => {
		const call = Modal.call({
			title: t`Search`,
			size: 'lg',
			children: <SearchModal onClose={() => Modal.end(call, undefined)} />,
		});
	};

	useShortcut('OPEN_SEARCH_KEY', handleOpenSearch, { enabled: !isMobile });
	useShortcut('OPEN_CREATE_COLLECTION_KEY', handleCreateCollection, {
		enabled: !isMobile,
	});
	useShortcut('OPEN_CREATE_LINK_KEY', handleCreateLink, { enabled: !isMobile });

	return {
		handleCreateCollection,
		handleEditCollection,
		handleDeleteCollection,
		handleCreateLink,
		handleOpenSearch,
	};
}
