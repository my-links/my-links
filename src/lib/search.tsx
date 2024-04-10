import PATHS from 'constants/paths';
import {
  CategoryWithLinks,
  LinkWithCategory,
  SearchItem,
  SearchResult,
} from 'types/types';

export function buildSearchItem(
  item: CategoryWithLinks | LinkWithCategory,
  type: SearchItem['type'],
): SearchItem {
  return {
    id: item.id,
    name: item.name,
    url:
      type === 'link'
        ? (item as LinkWithCategory).url
        : `${PATHS.APP}?categoryId=${item.id}`,
    type,
    category: type === 'link' ? (item as LinkWithCategory).category : undefined,
  };
}

export function formatSearchItem(
  item: SearchItem,
  searchTerm: string,
): SearchResult | null {
  const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
  const lowerCaseName = item.name.toLowerCase().trim();

  let currentIndex = 0;
  let formattedName = '';

  for (let i = 0; i < lowerCaseName.length; i++) {
    if (lowerCaseName[i] === lowerCaseSearchTerm[currentIndex]) {
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
    category: item.category,
  };
}
