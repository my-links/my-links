import { Category } from "types";
import CategoryItem from "./CategoryItem";

import { useMemo } from "react";
import styles from "./categories.module.scss";

interface CategoriesProps {
  categories: Category[];
  categoryActive: Category;
  handleSelectCategory: (category: Category) => void;
}
export default function Categories({
  categories,
  categoryActive,
  handleSelectCategory,
}: CategoriesProps) {
  const linksCount = useMemo(
    () => categories.reduce((acc, current) => (acc += current.links.length), 0),
    [categories]
  );
  return (
    <div className={styles["categories"]}>
      <h4>Catégories • {linksCount}</h4>
      <ul className={styles["items"]}>
        {categories.map((category, index) => (
          <CategoryItem
            category={category}
            categoryActive={categoryActive}
            handleSelectCategory={handleSelectCategory}
            key={category.id}
            index={index}
          />
        ))}
      </ul>
    </div>
  );
}
