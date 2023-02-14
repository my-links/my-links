import LinkTag from "next/link";

import styles from "../../styles/home/categories.module.scss";
import { Category } from "../../types";

import EditSVG from "../../public/icons/edit.svg";
import RemoveSVG from "../../public/icons/remove.svg";

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
    <div className={`${styles["block-wrapper"]} ${styles["categories"]}`}>
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

interface CategoryItemProps {
  category: Category;
  categoryActive: Category;
  handleSelectCategory: (category: Category) => void;
}
function CategoryItem({
  category,
  categoryActive,
  handleSelectCategory,
}: CategoryItemProps): JSX.Element {
  const className = `${styles["item"]} ${
    category.id === categoryActive.id ? styles["active"] : ""
  }`;
  const onClick = () => handleSelectCategory(category);

  return (
    <li className={className} onClick={onClick}>
      <div className={styles["content"]}>
        <span className={styles["name"]}>{category.name}</span>
        <span className={styles["links-count"]}>— {category.links.length}</span>
      </div>
      <MenuOptions id={category.id} />
    </li>
  );
}

function MenuOptions({ id }: { id: number }): JSX.Element {
  return (
    <div className={styles["menu-item"]}>
      <LinkTag href={`/category/edit/${id}`} className={styles["option-edit"]}>
        <EditSVG />
      </LinkTag>
      <LinkTag
        href={`/category/remove/${id}`}
        className={styles["option-remove"]}
      >
        <RemoveSVG />
      </LinkTag>
    </div>
  );
}
