import { Category } from "types";
import CategoryItem from "./CategoryItem";

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
  return (
    <div className={styles["categories"]}>
      <h4>Catégories</h4>
      <ul className={styles["items"]}>
        {categories.map((category, key) => (
          <CategoryItem
            category={category}
            categoryActive={categoryActive}
            handleSelectCategory={handleSelectCategory}
            key={key}
          />
        ))}
      </ul>
    </div>
  );
}
