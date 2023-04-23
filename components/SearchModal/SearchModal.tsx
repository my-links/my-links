import LinkTag from "next/link";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { FcGoogle } from "react-icons/fc";

import useAutoFocus from "../../hooks/useAutoFocus";

import FormLayout from "../FormLayout";
import LinkFavicon from "../Links/LinkFavicon";
import Modal from "../Modal/Modal";
import TextBox from "../TextBox";

import { Category, ItemComplete, Link } from "../../types";

import styles from "./search.module.scss";

export default function SearchModal({
  close,
  handleSelectCategory,
  categories,
  favorites,
  items,
}: {
  close: any;
  handleSelectCategory: (category: Category) => void;
  categories: Category[];
  favorites: Link[];
  items: ItemComplete[];
}) {
  const autoFocusRef = useAutoFocus();

  const [search, setSearch] = useState<string>("");
  const canSubmit = useMemo<boolean>(() => search.length > 0, [search]);

  const itemsCompletion = useMemo(() => {
    if (search.length === 0) {
      return [];
    }
    return items.filter((item) =>
      item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase().trim())
    );
  }, [items, search]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setSearch("");
      if (itemsCompletion.length > 0) {
        const firstItem = itemsCompletion[0];
        if (firstItem.type === "link") {
          window.open(firstItem.url);
        } else {
          const category = categories.find((c) => c.id === firstItem.id);
          console.log(category);
          if (category) {
            handleSelectCategory(category);
          }
        }
      } else {
        window.open(`https://google.com/search?q=${encodeURI(search.trim())}`);
      }
      close();
    },
    [categories, close, handleSelectCategory, itemsCompletion, search]
  );

  return (
    <Modal title="Rechercher" close={close}>
      <FormLayout
        title="Search"
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
      >
        <TextBox
          name="search"
          onChangeCallback={(value) => setSearch(value)}
          value={search}
          placeholder="Rechercher"
          innerRef={autoFocusRef}
          fieldClass={styles["search-input-field"]}
        />
        {search.length === 0 && favorites.length > 0 && (
          <ListItemComponent
            items={favorites.map((favorite) => ({
              id: favorite.id,
              name: favorite.name,
              url: favorite.url,
              type: "link",
            }))}
            noItem={<p>ajouter un favoris</p>}
          />
        )}
        {search.length > 0 && (
          <ListItemComponent
            items={itemsCompletion.map((item) => ({
              id: item.id,
              name: item.name,
              url: item.url,
              type: item.type,
            }))}
            noItem={
              <i
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".25em",
                }}
              >
                Recherche avec{" "}
                <span style={{ display: "flex", alignItems: "center" }}>
                  <FcGoogle size={24} />
                  oogle
                </span>
              </i>
            }
          />
        )}
      </FormLayout>
    </Modal>
  );
}

function ListItemComponent({
  items,
  noItem,
}: {
  items: ItemComplete[];
  noItem?: ReactNode;
}) {
  return (
    <ul
      style={{
        margin: "1em 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1em",
        flexWrap: "wrap",
      }}
    >
      {items.length > 0 ? (
        items.map((item) => (
          <ItemComponent
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
        <i>no item found</i>
      )}
    </ul>
  );
}

function ItemComponent({ item }: { item: ItemComplete }) {
  const { name, type, url } = item;
  return (
    <li>
      <LinkTag
        href={url}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
        target="_blank"
        rel="no-referrer"
      >
        {type === "link" ? (
          <LinkFavicon url={item.url} noMargin />
        ) : (
          <span>category</span>
        )}
        <span>{name}</span>
      </LinkTag>
    </li>
  );
}
