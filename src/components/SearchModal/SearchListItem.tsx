import LinkTag from "next/link";
import { AiOutlineFolder } from "react-icons/ai";

import LinkFavicon from "components/Links/LinkFavicon";
import { SearchItem } from "types";

import styles from "./search.module.scss";

export default function SearchListItem({ item }: { item: SearchItem }) {
  const { name, type, url } = item;
  return (
    <li className={styles["search-item"]}>
      <LinkTag href={url} target="_blank" rel="no-referrer">
        {type === "link" ? (
          <LinkFavicon url={item.url} noMargin />
        ) : (
          <AiOutlineFolder size={32} />
        )}
        <span>{name}</span>
      </LinkTag>
    </li>
  );
}
