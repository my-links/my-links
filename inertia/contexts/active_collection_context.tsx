import { createContext } from 'react';
import { CollectionWithLinks } from '~/types/app';

type ActiveCollectionContextType = {
  activeCollection: CollectionWithLinks | null;
  setActiveCollection: (collection: CollectionWithLinks) => void;
};

const iActiveCollectionContextState: ActiveCollectionContextType = {
  activeCollection: null,
  setActiveCollection: (_: CollectionWithLinks) => {},
};

export const ActiveCollectionContext =
  createContext<ActiveCollectionContextType>(iActiveCollectionContextState);
