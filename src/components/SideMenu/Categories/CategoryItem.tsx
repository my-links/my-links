import { useEffect, useRef } from "react";
import { AiFillFolderOpen, AiOutlineFolder } from "react-icons/ai";

import { Category } from "types";

import { motion } from "framer-motion";
import styles from "./categories.module.scss";

interface CategoryItemProps {
  category: Category;
  categoryActive: Category;
  handleSelectCategory: (category: Category) => void;
  index: number;
}

export default function CategoryItem({
  category,
  categoryActive,
  handleSelectCategory,
  index,
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
    <motion.li
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 25,
        delay: index * 0.02,
        duration: 200,
      }}
      className={className}
      ref={ref}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: ".25em",
        transition: "none",
      }}
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
    </motion.li>
  );
}
