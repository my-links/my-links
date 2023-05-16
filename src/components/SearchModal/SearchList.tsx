import { ReactNode } from "react";

import { SearchItem } from "types";
import SearchListItem from "./SearchListItem";

import styles from "./search.module.scss";

export default function SearchList({
  items,
  noItem,
}: {
  items: SearchItem[];
  noItem?: ReactNode;
}) {
  return (
    <ul className={styles["search-list"]}>
      {items.length > 0 ? (
        items.map((item) => (
          <SearchListItem
            item={{
              id: item.id,
              name: item.name,
              url: item.url,
              type: item.type,
            }}
            key={item.type + "-" + item.id}
          />
        ))
      ) : noItem ? (
        noItem
      ) : (
        <LabelNoItem />
      )}
    </ul>
  );
}

function LabelNoItem() {
  return <i className={styles["no-item"]}>Aucun élément trouvé</i>;
}
