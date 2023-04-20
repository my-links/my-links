import { Link } from "../../../types";
import FavoriteItem from "./FavoriteItem";

import styles from "./favorites.module.scss";

export default function Favorites({ favorites }: { favorites: Link[] }) {
  return (
    favorites.length !== 0 && (
      <div className={styles["favorites"]}>
        <h4>Favoris</h4>
        <ul className={styles["items"]}>
          {favorites.map((link, key) => (
            <FavoriteItem link={link} key={key} />
          ))}
        </ul>
      </div>
    )
  );
}
