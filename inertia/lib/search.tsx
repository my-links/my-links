import PATHS from '#constants/paths';
import Collection from '#models/collection';
import Link from '#models/link';
import { SearchItem, SearchResult } from '~/types/search';

export function buildSearchItem(
  item: Collection | Link,
  type: SearchItem['type']
): SearchItem {
  return {
    id: item.id,
    name: item.name,
    url:
      type === 'link'
        ? (item as Link).url
        : `${PATHS.DASHBOARD}?collectionId=${item.id}`,
    type,
    collection: type === 'link' ? (item as Link).collection : undefined,
  };
}

export function formatSearchItem(
  item: SearchItem,
  searchTerm: string
): SearchResult | null {
  const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
  const lowerCaseName = item.name.toLowerCase().trim();

  let currentIndex = 0;
  let formattedName = '';

  for (const [i, element] of Object(lowerCaseName).entries()) {
    if (element === lowerCaseSearchTerm[currentIndex]) {
      formattedName += `<b>${item.name[i]}</b>`;
      currentIndex++;
    } else {
      formattedName += item.name[i];
    }
  }

  if (currentIndex !== lowerCaseSearchTerm.length) {
    // Search term not fully matched
    return null;
  }

  return {
    id: item.id,
    name: <div dangerouslySetInnerHTML={{ __html: formattedName }} />,
    url: item.url,
    type: item.type,
    collection: item.collection,
  };
}
