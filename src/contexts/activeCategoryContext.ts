import { Dispatch, SetStateAction, createContext } from 'react';
import { CategoryWithRelations } from 'types/types';

type ActiveCategoryContextType = {
  activeCategory: CategoryWithRelations | null;
  setActiveCategory: Dispatch<SetStateAction<CategoryWithRelations>>;
};

const iActiveCategoryContextState = {
  activeCategory: null,
  setActiveCategory: (_: CategoryWithRelations) => {},
};

const ActiveCategoryContext = createContext<ActiveCategoryContextType>(
  iActiveCategoryContextState,
);

export default ActiveCategoryContext;
