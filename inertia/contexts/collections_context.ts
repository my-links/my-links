import Collection from '#models/collection';
import { createContext } from 'react';

type CollectionsContextType = {
  collections: Collection[];
  setCollections: (collections: Collection[]) => void | Collection[];
};

const iCollectionsContextState: CollectionsContextType = {
  collections: [] as Collection[],
  setCollections: (_: Collection[]) => {},
};

const CollectionsContext = createContext<CollectionsContextType>(
  iCollectionsContextState
);

export default CollectionsContext;
