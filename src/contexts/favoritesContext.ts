import { createContext } from 'react';
import { LinkWithRelations } from 'types/types';

type FavoritesContextType = {
  favorites: LinkWithRelations[];
};

const iFavoritesContextState = {
  favorites: [] as LinkWithRelations[],
};

const FavoritesContext = createContext<FavoritesContextType>(
  iFavoritesContextState,
);

export default FavoritesContext;
