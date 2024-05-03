import type Collection from '#models/collection';
import { createContext } from 'react';

type ActiveCollectionContextType = {
  activeCollection: Collection | null;
  setActiveCollection: (collection: Collection) => void;
};

const iActiveCollectionContextState: ActiveCollectionContextType = {
  activeCollection: null,
  setActiveCollection: (_: Collection) => {},
};

export const ActiveCollectionContext =
  createContext<ActiveCollectionContextType>(iActiveCollectionContextState);
