import { ReactNode, useEffect, useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { SearchItem } from "types";
import { groupItemBy } from "utils/array";
import SearchListItem from "./SearchListItem";

import * as Keys from "constants/keys";

import styles from "./search.module.scss";

const isActiveItem = (item: SearchItem, otherItem: SearchItem) =>
  item?.id === otherItem?.id && item?.type === otherItem?.type;
export default function SearchList({
  items,
  selectedItem,
  setSelectedItem,
  noItem,
  closeModal,
}: {
  items: SearchItem[];
  selectedItem: SearchItem;
  setSelectedItem: (item: SearchItem) => void;
  noItem?: ReactNode;
  closeModal: () => void;
}) {
  const searchItemsGrouped = useMemo(
    () => groupItemBy(items, "category.name"),
    [items]
  );
  const groupedItems = useMemo<any>(
    () => Object.entries(searchItemsGrouped),
    [searchItemsGrouped]
  );

  const selectedItemIndex = useMemo<number>(
    () => items.findIndex((item) => isActiveItem(item, selectedItem)),
    [items, selectedItem]
  );

  useHotkeys(
    Keys.ARROW_UP,
    () => setSelectedItem(items[selectedItemIndex - 1]),
    {
      enableOnFormTags: ["INPUT"],
      enabled: items.length > 1 && selectedItemIndex !== 0,
      preventDefault: true,
    }
  );
  useHotkeys(
    Keys.ARROW_DOWN,
    () => setSelectedItem(items[selectedItemIndex + 1]),
    {
      enableOnFormTags: ["INPUT"],
      enabled: items.length > 1 && selectedItemIndex !== items.length - 1,
      preventDefault: true,
    }
  );

  useEffect(() => {
    setSelectedItem(items[0]);
  }, [items, setSelectedItem]);

  return (
    <ul className={styles["search-list"]}>
      {groupedItems.length > 0 ? (
        groupedItems.map(([key, items]) => (
          <li key={key + "-" + key}>
            <li>{typeof key === "undefined" ? "-" : key}</li>
            {items.map((item) => (
              <SearchListItem
                item={item}
                selected={isActiveItem(item, selectedItem)}
                closeModal={closeModal}
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
