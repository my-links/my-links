import { createContext } from 'react';
import { Link } from '~/types/app';

type FavoritesContextType = {
  favorites: Link[];
};

const iFavoritesContextState = {
  favorites: [] as Link[],
};

const FavoritesContext = createContext<FavoritesContextType>(
  iFavoritesContextState
);

export default FavoritesContext;
