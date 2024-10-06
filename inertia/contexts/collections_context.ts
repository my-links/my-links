import { createContext } from 'react';
import { CollectionWithLinks } from '~/types/app';

type CollectionsContextType = {
	collections: CollectionWithLinks[];
	setCollections: (
		collections: CollectionWithLinks[]
	) => void | CollectionWithLinks[];
};

const iCollectionsContextState: CollectionsContextType = {
	collections: [] as CollectionWithLinks[],
	setCollections: (_: CollectionWithLinks[]) => {},
};

const CollectionsContext = createContext<CollectionsContextType>(
	iCollectionsContextState
);

export default CollectionsContext;
