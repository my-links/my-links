import { useEffect, useRef } from "react";
import { AiFillFolderOpen, AiOutlineFolder } from "react-icons/ai";

import { Category } from "types";

import styles from "./categories.module.scss";

interface CategoryItemProps {
  category: Category;
  categoryActive: Category;
  handleSelectCategory: (category: Category) => void;
}

export default function CategoryItem({
  category,
  categoryActive,
  handleSelectCategory,
}: CategoryItemProps): JSX.Element {
  const ref = useRef<HTMLLIElement>();
  const className = `${styles["item"]} ${
    category.id === categoryActive.id ? styles["active"] : ""
  }`;
  const onClick = () => handleSelectCategory(category);

  useEffect(() => {
    if (category.id === categoryActive.id) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [category.id, categoryActive.id]);

  return (
    <li
      className={className}
      ref={ref}
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: ".25em" }}
    >
      {category.id === categoryActive.id ? (
        <AiFillFolderOpen size={24} />
      ) : (
        <AiOutlineFolder size={24} />
      )}

      <div className={styles["content"]}>
        <span className={styles["name"]}>{category.name}</span>
        <span className={styles["links-count"]}>— {category.links.length}</span>
      </div>
    </li>
  );
}
