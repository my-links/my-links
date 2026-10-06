import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { MenuItem } from '@minimalstuff/ui';
import type { MouseEvent as ReactMouseEvent } from 'react';

type MenuClickHandler = (event: ReactMouseEvent<HTMLButtonElement>) => void;

type CollectionMenuItemsProps = {
	collection: Data.Collection;
	onCreateLink: MenuClickHandler;
	onEditCollection: MenuClickHandler;
	onDeleteCollection: MenuClickHandler;
};

export const CollectionMenuItems = ({
	collection,
	onCreateLink,
	onEditCollection,
	onDeleteCollection,
}: Readonly<CollectionMenuItemsProps>) => (
	<>
		<MenuItem icon="i-ant-design-plus-outlined" onClick={onCreateLink}>
			<Trans>Add link</Trans>
		</MenuItem>
		{!collection.isDefault && (
			<>
				<MenuItem icon="i-octicon-pencil" onClick={onEditCollection}>
					<Trans>Edit collection</Trans>
				</MenuItem>
				<MenuItem
					icon="i-ion-trash-outline"
					onClick={onDeleteCollection}
					danger
				>
					<Trans>Delete collection</Trans>
				</MenuItem>
			</>
		)}
	</>
);
