import { createContext } from 'react';
import { LinkWithCategory } from 'types/types';

type FavoritesContextType = {
  favorites: LinkWithCategory[];
};

const iFavoritesContextState = {
  favorites: [] as LinkWithCategory[],
};

const FavoritesContext = createContext<FavoritesContextType>(
  iFavoritesContextState,
);

export default FavoritesContext;
