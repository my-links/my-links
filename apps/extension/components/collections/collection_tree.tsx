import { useCollections } from '@/hooks/use_collections';
import { CollectionSection } from './collection_section';
import { FollowedCollectionsGroup } from './followed_collections_group';

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

	return (
		<div className="flex-1 space-y-1 overflow-y-auto px-2 py-1">
			<FollowedCollectionsGroup />
			{collections.length === 0 ? (
				<p className="p-4 text-sm text-gray-500">No collections yet.</p>
			) : (
				collections.map((collection) => (
					<CollectionSection key={collection.id} collection={collection} />
				))
			)}
		</div>
	);
}
