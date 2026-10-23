import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Data } from '@generated/data';

import { SortableCollectionItem } from './sortable_collection_item';
import type { CollectionSection } from '~/lib/dnd/dnd_types';

type CollectionWithLinks = Data.Collection.Variants['withLinks'];

type SortableCollectionGroupProps = {
	collections: CollectionWithLinks[];
	section: CollectionSection;
};

export const SortableCollectionGroup = ({
	collections,
	section,
}: Readonly<SortableCollectionGroupProps>) => (
	<SortableContext
		items={collections.map((collection) => collection.id)}
		strategy={verticalListSortingStrategy}
	>
		{collections.map((collection) => (
			<SortableCollectionItem
				key={collection.id}
				collection={collection}
				section={section}
			/>
		))}
	</SortableContext>
);
