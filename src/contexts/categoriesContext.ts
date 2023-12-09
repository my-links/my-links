import { Dispatch, SetStateAction, createContext } from 'react';
import { CategoryWithRelations } from 'types/types';

type CategoriesContextType = {
  categories: CategoryWithRelations[];
  setCategories: Dispatch<SetStateAction<CategoryWithRelations[]>>;
};

const iCategoriesContextState = {
  categories: [] as CategoryWithRelations[],
  setCategories: (_: CategoryWithRelations[]) => {},
};

const CategoriesContext = createContext<CategoriesContextType>(
  iCategoriesContextState,
);

export default CategoriesContext;
