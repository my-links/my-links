import { ReactNode, useMemo } from "react";

import { SearchItem } from "types";
import SearchListItem from "./SearchListItem";

import styles from "./search.module.scss";

export default function SearchList({
  items,
  noItem,
  cursor,
  setCursor,
}: {
  items: SearchItem[];
  noItem?: ReactNode;
  cursor: number;
  setCursor: (cursor: number) => void;
}) {
  return (
    <ul className={styles["search-list"]}>
      {items.length > 0 ? (
        items.map((item, index) => (
          <SearchListItem
            item={{
              id: item.id,
              name: item.name,
              url: item.url,
              type: item.type,
            }}
            setCursor={setCursor}
            selected={index === cursor}
            index={index}
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
