import { useTranslation } from "next-i18next";
import { Link } from "types";
import FavoriteItem from "./FavoriteItem";
import styles from "./favorites.module.scss";

export default function Favorites({ favorites }: { favorites: Link[] }) {
  const { t } = useTranslation();

  return (
    favorites.length !== 0 && (
      <div className={styles["favorites"]}>
        <h4>{t("common:favorite")}</h4>
        <ul className={styles["items"]}>
          {favorites.map((link) => (
            <FavoriteItem link={link} key={link.id} />
          ))}
        </ul>
      </div>
    )
  );
}
