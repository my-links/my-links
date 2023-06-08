import { motion } from "framer-motion";
import LinkTag from "next/link";

import { Category, Link } from "types";

import EditItem from "components/QuickActions/EditItem";
import RemoveItem from "components/QuickActions/RemoveItem";
import LinkItem from "./LinkItem";

import ButtonLink from "components/ButtonLink";
import CreateItem from "components/QuickActions/CreateItem";
import QuickActionSearch from "components/QuickActions/Search";
import { RxHamburgerMenu } from "react-icons/rx";
import styles from "./links.module.scss";

export default function Links({
  category,
  toggleFavorite,
  isMobile,
  openMobileModal,
  openSearchModal,
}: {
  category: Category;
  toggleFavorite: (linkId: Link["id"]) => void;
  isMobile: boolean;
  openMobileModal: () => void;
  openSearchModal: () => void;
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
        <span
          className={styles["category-name"]}
          style={{ display: "flex", alignItems: "center", gap: ".25em" }}
        >
          {isMobile && (
            <ButtonLink
              style={{
                display: "flex",
              }}
              onClick={openMobileModal}
            >
              <RxHamburgerMenu size={"1.5em"} style={{ marginRight: ".5em" }} />
            </ButtonLink>
          )}
          {name}
          {links.length > 0 && (
            <span className={styles["links-count"]}> — {links.length}</span>
          )}
        </span>
        <span className={styles["category-controls"]}>
          <QuickActionSearch openSearchModal={openSearchModal} />
          <CreateItem type="link" categoryId={category.id} />
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
          <motion.p
            key={Math.random()}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.01,
            }}
          >
            Aucun lien pour <b>{name}</b>
          </motion.p>
          <LinkTag href={`/link/create?categoryId=${id}`}>
            Créer un lien
          </LinkTag>
        </div>
      )}
    </div>
  );
}
