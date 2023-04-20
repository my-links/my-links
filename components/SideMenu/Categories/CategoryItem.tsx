import LinkTag from "next/link";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";

import { Category } from "../../../types";

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
        <AiFillEdit />
      </LinkTag>
      <LinkTag
        href={`/category/remove/${id}`}
        className={styles["option-remove"]}
      >
        <AiFillDelete color="red" />
      </LinkTag>
    </div>
  );
}
