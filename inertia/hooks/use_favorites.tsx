import { useContext } from 'react';
import FavoritesContext from '~/contexts/favorites_context';

const useFavorites = () => useContext(FavoritesContext);
export default useFavorites;
