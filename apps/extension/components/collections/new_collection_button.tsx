import { IconButton, Modal } from '@minimalstuff/ui';

import { CreateCollectionModal } from './create_collection_modal';

export function NewCollectionButton() {
	const handleClick = () => {
		const call = Modal.call({
			title: 'New collection',
			children: <CreateCollectionModal onClose={() => Modal.end(call)} />,
		});
	};

	return (
		<IconButton
			icon="i-ant-design-folder-add-outlined"
			aria-label="New collection"
			size="sm"
			variant="ghost"
			onClick={handleClick}
		/>
	);
}
