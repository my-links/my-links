import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useCollections } from '@/hooks/use_collections';
import { CollectionSection } from './collection_section';
import type { CollectionWithLinks } from '@/lib/api/types';
import { CollectionsDndProvider } from './collections_dnd_provider';
import { FollowedCollectionsGroup } from './followed_collections_group';
import { COLLECTION_SECTION, collectionSortableId } from '@/lib/dnd/dnd_types';

function byPosition(a: CollectionWithLinks, b: CollectionWithLinks) {
	return a.position - b.position;
}

export function CollectionTree() {
	const { collections, isLoading, error } = useCollections();

	if (isLoading) {
		return <p className="p-4 text-sm text-gray-500">Loading collections…</p>;
	}

	if (error) {
		return (
			<p className="p-4 text-sm text-red-500">
				Couldn't load collections. Check your connection.
			</p>
		);
	}

	const privateCollections = collections
		.filter((collection) => collection.visibility === 'PRIVATE')
		.sort(byPosition);
	const publicCollections = collections
		.filter((collection) => collection.visibility === 'PUBLIC')
		.sort(byPosition);

	return (
		<div className="flex-1 space-y-1 overflow-y-auto px-2 py-1">
			<FollowedCollectionsGroup />
			{collections.length === 0 ? (
				<p className="p-4 text-sm text-gray-500">No collections yet.</p>
			) : (
				<CollectionsDndProvider>
					{privateCollections.length > 0 && (
						<div>
							<p className="px-2 pb-0.5 pt-2 text-xs font-semibold uppercase text-gray-400">
								Private
							</p>
							<SortableContext
								items={privateCollections.map((collection) =>
									collectionSortableId(collection.id)
								)}
								strategy={verticalListSortingStrategy}
							>
								{privateCollections.map((collection) => (
									<CollectionSection
										key={collection.id}
										collection={collection}
										section={COLLECTION_SECTION.PRIVATE}
									/>
								))}
							</SortableContext>
						</div>
					)}
					{publicCollections.length > 0 && (
						<div>
							<p className="px-2 pb-0.5 pt-2 text-xs font-semibold uppercase text-gray-400">
								Public
							</p>
							<SortableContext
								items={publicCollections.map((collection) =>
									collectionSortableId(collection.id)
								)}
								strategy={verticalListSortingStrategy}
							>
								{publicCollections.map((collection) => (
									<CollectionSection
										key={collection.id}
										collection={collection}
										section={COLLECTION_SECTION.PUBLIC}
									/>
								))}
							</SortableContext>
						</div>
					)}
				</CollectionsDndProvider>
			)}
		</div>
	);
}
