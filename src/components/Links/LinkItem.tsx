import LinkTag from "next/link";
import { useState } from "react";
import {
  AiFillDelete,
  AiFillEdit,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";

import { Link } from "types";
import LinkFavicon from "./LinkFavicon";

import styles from "./links.module.scss";

export default function LinkItem({ link }: { link: Link }) {
  const { id, name, url, favorite } = link;
  const [isFavorite, setFavorite] = useState(favorite);

  return (
    <li className={styles["link"]} key={id}>
      <LinkFavicon url={url} />
      <LinkTag href={url} target={"_blank"} rel={"noreferrer"}>
        <span className={styles["link-name"]}>
          {name} {isFavorite && <AiFillStar color="#ffc107" />}
        </span>
        <LinkItemURL url={url} />
      </LinkTag>
      <div className={styles["controls"]}>
        <div onClick={() => setFavorite((v) => !v)} className={styles["edit"]}>
          {isFavorite ? (
            <AiFillStar color="#ffc107" />
          ) : (
            <AiOutlineStar color="#ffc107" />
          )}
        </div>
        <LinkTag
          href={`/link/edit/${id}`}
          className={styles["edit"]}
          title="Edit link"
        >
          <AiFillEdit />
        </LinkTag>
        <LinkTag
          href={`/link/remove/${id}`}
          className={styles["remove"]}
          title="Remove link"
        >
          <AiFillDelete color="red" />
        </LinkTag>
      </div>
    </li>
  );
}

function LinkItemURL({ url }: { url: string }) {
  try {
    const { origin, pathname, search } = new URL(url);
    let text = "";

    if (pathname !== "/") {
      text += pathname;
    }

    if (search !== "") {
      if (text === "") {
        text += "/";
      }
      text += search;
    }

    return (
      <span className={styles["link-url"]}>
        {origin}
        <span className={styles["url-pathname"]}>{text}</span>
      </span>
    );
  } catch (error) {
    console.error("error", error);
    return <span className={styles["link-url"]}>{url}</span>;
  }
}
