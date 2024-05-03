import type Link from '#models/link';
import { createContext } from 'react';

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
