import { CategoryWithLinks } from 'types/types';

type Category = CategoryWithLinks;

export default function sortCategoriesByNextId(
  categories: Category[],
): Category[] {
  const sortedCategories: Category[] = [];

  const visit = (category: Category) => {
    // Check if the category has been visited
    if (sortedCategories.includes(category)) {
      return;
    }

    // Visit the next category recursively
    const nextCategory = categories.find((c) => c.id === category.nextId);
    if (nextCategory) {
      visit(nextCategory);
    }

    // Add the current category to the sorted array
    sortedCategories.push(category);
  };

  // Visit each category to build the sorted array
  categories.forEach((category) => visit(category));

  return sortedCategories.reverse();
}
