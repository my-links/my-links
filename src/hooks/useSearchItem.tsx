import { buildSearchItem, formatSearchItem } from 'lib/search';
import { useMemo } from 'react';
import { SearchItem, SearchResult } from 'types/types';
import useCategories from './useCategories';

export default function useSearchItem({
  searchTerm = '',
  disableLinks = false,
  disableCategories = false,
}: {
  searchTerm: string;
  disableLinks?: boolean;
  disableCategories?: boolean;
}) {
  const { categories } = useCategories();

  const itemsSearch = useMemo<SearchItem[]>(() => {
    return categories.reduce((acc, category) => {
      const categoryItem = buildSearchItem(category, 'category');
      const items: SearchItem[] = category.links.map((link) =>
        buildSearchItem(link, 'link'),
      );
      return [...acc, ...items, categoryItem];
    }, [] as SearchItem[]);
  }, [categories]);

  const itemsCompletion = useMemo(() => {
    return itemsSearch.reduce((acc, item) => {
      const formattedItem = formatSearchItem(item, searchTerm);

      if (
        (!disableLinks && item.type === 'link') ||
        (!disableCategories && item.type === 'category')
      ) {
        return formattedItem ? [...acc, formattedItem] : acc;
      }

      return acc;
    }, [] as SearchResult[]);
  }, [itemsSearch, searchTerm, disableLinks, disableCategories]);

  return itemsCompletion;
}
