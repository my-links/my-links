import CategoriesContext from 'contexts/categoriesContext';
import { useContext } from 'react';

export default function useCategories() {
  return useContext(CategoriesContext);
}
