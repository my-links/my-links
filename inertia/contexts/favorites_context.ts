import { createContext } from 'react';
import { LinkWithCollection } from '~/types/app';

type FavoritesContextType = {
	favorites: LinkWithCollection[];
};

const iFavoritesContextState = {
	favorites: [] as LinkWithCollection[],
};

const FavoritesContext = createContext<FavoritesContextType>(
	iFavoritesContextState
);

export default FavoritesContext;
