import LinkTag from "next/link";

import { Link } from "../../../types";
import LinkFavicon from "../../Links/LinkFavicon";

import styles from "./favorites.module.scss";

export default function FavoriteItem({ link }: { link: Link }): JSX.Element {
  const { name, url, category } = link;
  return (
    <li className={styles["item"]}>
      <LinkTag href={url} target={"_blank"} rel={"noreferrer"}>
        <LinkFavicon url={url} size={24} />
        <span>{name}</span>
        <span className={styles["category"]}> - {category.name}</span>
      </LinkTag>
    </li>
  );
}
