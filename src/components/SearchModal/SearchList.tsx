import { ReactNode, useMemo } from "react";

import { SearchItem } from "types";
import { groupItemBy } from "utils/array";
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
  const searchItemsGrouped = useMemo(
    () => groupItemBy(items, "category.name"),
    [items]
  );
  const groupedItems = useMemo<any>(
    () => Object.entries(searchItemsGrouped),
    [searchItemsGrouped]
  );

  return (
    <ul className={styles["search-list"]}>
      {groupedItems.length > 0 ? (
        groupedItems.map(([key, items], index) => (
          <li key={key + "-" + key}>
            <span>{typeof key === "undefined" ? "-" : key}</span>
            {items.map((item) => (
              <SearchListItem
                item={item}
                setCursor={setCursor}
                selected={index === cursor}
                index={index}
                key={item.id}
              />
            ))}
          </li>
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
