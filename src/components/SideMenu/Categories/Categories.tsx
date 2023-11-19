import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import { Category } from "types";
import CategoryItem from "./CategoryItem";
import styles from "./categories.module.scss";
import clsx from "clsx";

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
  const { t } = useTranslation();
  const linksCount = useMemo(
    () => categories.reduce((acc, current) => (acc += current.links.length), 0),
    [categories],
  );

  return (
    <div className={styles["categories"]}>
      <h4>
        {t("common:category.categories")} • {linksCount}
      </h4>
      <ul className={clsx(styles["items"], "reset")}>
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
