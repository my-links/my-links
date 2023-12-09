import FavoritesContext from 'contexts/favoritesContext';
import { useContext } from 'react';

export default function useFavorites() {
  return useContext(FavoritesContext);
}
