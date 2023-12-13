import { Dispatch, SetStateAction, createContext } from 'react';
import { CategoryWithLinks } from 'types/types';

type CategoriesContextType = {
  categories: CategoryWithLinks[];
  setCategories: Dispatch<SetStateAction<CategoryWithLinks[]>>;
};

const iCategoriesContextState = {
  categories: [] as CategoryWithLinks[],
  setCategories: (_: CategoryWithLinks[]) => {},
};

const CategoriesContext = createContext<CategoriesContextType>(
  iCategoriesContextState,
);

export default CategoriesContext;
