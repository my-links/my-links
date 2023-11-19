import ButtonLink from "components/ButtonLink";
import CreateItem from "components/QuickActions/CreateItem";
import EditItem from "components/QuickActions/EditItem";
import RemoveItem from "components/QuickActions/RemoveItem";
import QuickActionSearch from "components/QuickActions/Search";
import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import LinkTag from "next/link";
import { RxHamburgerMenu } from "react-icons/rx";
import { Category, Link } from "types";
import { TFunctionParam } from "types/i18next";
import LinkItem from "./LinkItem";
import styles from "./links.module.scss";
import clsx from "clsx";

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
  const { t } = useTranslation("home");

  if (category === null) {
    return (
      <div className={styles["no-category"]}>
        <p>{t("home:select-categorie")}</p>
        <LinkTag href="/category/create">{t("home:or-create-one")}</LinkTag>
      </div>
    );
  }

  const { id, name, links } = category;
  return (
    <div className={styles["links-wrapper"]}>
      <h2 className={styles["category-header"]}>
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
        <span className={styles["category-name"]}>
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
        <ul className={clsx(styles["links"], "reset")}>
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
            dangerouslySetInnerHTML={{
              __html: t("home:no-link", { name } as TFunctionParam, {
                interpolation: { escapeValue: false },
              }),
            }}
          />
          <LinkTag href={`/link/create?categoryId=${id}`}>
            {t("common:link.create")}
          </LinkTag>
        </div>
      )}
    </div>
  );
}
