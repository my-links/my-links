import ActiveCategoryContext from 'contexts/activeCategoryContext';
import { useContext } from 'react';

export default function useActiveCategory() {
  return useContext(ActiveCategoryContext);
}
