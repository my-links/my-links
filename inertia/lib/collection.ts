import { CollectionWithLinks } from '~/types/app';

export default function sortCcollectionsByNextId(
	collections: CollectionWithLinks[]
): CollectionWithLinks[] {
	const sortedCollections: CollectionWithLinks[] = [];

	const visit = (collection: CollectionWithLinks) => {
		// Check if the collection has been visited
		if (sortedCollections.includes(collection)) {
			return;
		}

		// Visit the next collection recursively
		const nextCollection = collections.find((c) => c.id === collection.nextId);
		if (nextCollection) {
			visit(nextCollection);
		}

		// Add the current collection to the sorted array
		sortedCollections.push(collection);
	};

	// Visit each collection to build the sorted array
	collections.forEach((collection) => visit(collection));

	return sortedCollections.reverse();
}
