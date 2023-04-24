import LinkTag from "next/link";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { FcGoogle } from "react-icons/fc";

import useAutoFocus from "hooks/useAutoFocus";

import LinkFavicon from "components/Links/LinkFavicon";
import Modal from "components/Modal/Modal";
import TextBox from "components/TextBox";

import { Category, ItemComplete, Link } from "types";

import styles from "./search.module.scss";

const GOOGLE_SEARCH_URL = "https://google.com/search?q=";

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

  const itemsCompletion = useMemo(
    () =>
      search.length === 0
        ? []
        : items.filter((item) =>
            item.name
              .toLocaleLowerCase()
              .includes(search.toLocaleLowerCase().trim())
          ),
    [items, search]
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setSearch("");

      if (itemsCompletion.length === 0) {
        window.open(GOOGLE_SEARCH_URL + encodeURI(search.trim()));
        return close();
      }

      // TODO: replace "firstItem" by a "cursor"
      const firstItem = itemsCompletion[0];

      const category = categories.find((c) => c.id === firstItem.id);
      if (firstItem.type === "category" && category) {
        handleSelectCategory(category);
        return close();
      }

      window.open(firstItem.url);
      close();
    },
    [categories, close, handleSelectCategory, itemsCompletion, search]
  );

  return (
    <Modal title="Rechercher" close={close}>
      <form onSubmit={handleSubmit} className={styles["search-form"]}>
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
            noItem={<LabelSearchWithGoogle />}
          />
        )}
        <button type="submit" disabled={!canSubmit} style={{ display: "none" }}>
          Valider
        </button>
      </form>
    </Modal>
  );
}

function LabelSearchWithGoogle() {
  return (
    <i className={styles["search-with-google"]}>
      Recherche avec{" "}
      <span>
        <FcGoogle size={24} />
        oogle
      </span>
    </i>
  );
}

function LabelNoItem() {
  return <i className={styles["no-item"]}>Aucun élément trouvé</i>;
}

function ListItemComponent({
  items,
  noItem,
}: {
  items: ItemComplete[];
  noItem?: ReactNode;
}) {
  return (
    <ul className={styles["list-item"]}>
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
        <LabelNoItem />
      )}
    </ul>
  );
}

function ItemComponent({ item }: { item: ItemComplete }) {
  const { name, type, url } = item;
  return (
    <li className={styles["item"]}>
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
