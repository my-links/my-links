import LinkTag from "next/link";

import { Category, Link } from "types";

import EditItem from "components/QuickActions/EditItem";
import RemoveItem from "components/QuickActions/RemoveItem";
import LinkItem from "./LinkItem";

import { AnimatePresence, motion } from "framer-motion";
import styles from "./links.module.scss";

export default function Links({
  category,
  toggleFavorite,
}: {
  category: Category;
  toggleFavorite: (linkId: Link["id"]) => void;
}) {
  if (category === null) {
    return (
      <div className={styles["no-category"]}>
        <p>Veuillez séléctionner une categorié</p>
        <LinkTag href="/category/create">ou en créer une</LinkTag>
      </div>
    );
  }

  const { id, name, links } = category;
  return (
    <div className={styles["links-wrapper"]}>
      <h2 className={styles["category-header"]}>
        <span className={styles["category-name"]}>
          {name}
          {links.length > 0 && (
            <span className={styles["links-count"]}> — {links.length}</span>
          )}
        </span>
        <span className={styles["category-controls"]}>
          <EditItem type="category" id={id} />
          <RemoveItem type="category" id={id} />
        </span>
      </h2>
      {links.length !== 0 ? (
        <ul className={styles["links"]}>
          {links.map((link, index) => (
            <LinkItem
              link={link}
              toggleFavorite={toggleFavorite}
              index={index}
              key={link.id}
            />
          ))}
        </ul>
      ) : (
        <div className={styles["no-link"]}>
          <AnimatePresence>
            <motion.p
              key={Math.random()}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              Aucun lien pour <b>{name}</b>
            </motion.p>
          </AnimatePresence>
          <LinkTag href={`/link/create?categoryId=${id}`}>
            Créer un lien
          </LinkTag>
        </div>
      )}
    </div>
  );
}
