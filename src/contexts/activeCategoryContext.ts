import { Dispatch, SetStateAction, createContext } from 'react';
import { CategoryWithLinks } from 'types/types';

type ActiveCategoryContextType = {
  activeCategory: CategoryWithLinks | null;
  setActiveCategory: Dispatch<SetStateAction<CategoryWithLinks>>;
};

const iActiveCategoryContextState = {
  activeCategory: null,
  setActiveCategory: (_: CategoryWithLinks) => {},
};

const ActiveCategoryContext = createContext<ActiveCategoryContextType>(
  iActiveCategoryContextState,
);

export default ActiveCategoryContext;
