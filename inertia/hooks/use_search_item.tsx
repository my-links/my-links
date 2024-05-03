import { buildSearchItem, formatSearchItem } from 'lib/search';
import { useMemo } from 'react';
import useCollections from '~/hooks/use_collections';
import { SearchItem, SearchResult } from '~/types/search';

export default function useSearchItem({
  searchTerm = '',
  disableLinks = false,
  disableCollections = false,
}: {
  searchTerm: string;
  disableLinks?: boolean;
  disableCollections?: boolean;
}) {
  const { collections } = useCollections();

  const itemsSearch: SearchItem[] = useMemo<SearchItem[]>(() => {
    return collections.reduce((acc, collection) => {
      const collectionItem = buildSearchItem(collection, 'collection');
      const items: SearchItem[] = collection.links.map((link) =>
        buildSearchItem(link, 'link')
      );
      return [...acc, ...items, collectionItem];
    }, [] as SearchItem[]);
  }, [collections]);

  const itemsCompletion: SearchResult[] = useMemo(() => {
    return itemsSearch.reduce((acc, item) => {
      const formattedItem = formatSearchItem(item, searchTerm);

      if (
        (!disableLinks && item.type === 'link') ||
        (!disableCollections && item.type === 'collection')
      ) {
        return formattedItem ? [...acc, formattedItem] : acc;
      }

      return acc;
    }, [] as SearchResult[]);
  }, [itemsSearch, searchTerm, disableLinks, disableCollections]);

  return itemsCompletion;
}
