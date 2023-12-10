import { CategoryWithLinks } from 'types/types';

export default function sortCategoriesByNextId(
  categories: CategoryWithLinks[],
): CategoryWithLinks[] {
  const sortedCategories = categories.slice().sort((a, b) => {
    const nextIdA = a.nextId !== null ? a.nextId : Number.POSITIVE_INFINITY;
    const nextIdB = b.nextId !== null ? b.nextId : Number.POSITIVE_INFINITY;

    return nextIdA - nextIdB;
  });

  return sortedCategories;
}
