import { FormEvent, useCallback, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { BsSearch } from "react-icons/bs";

import useAutoFocus from "hooks/useAutoFocus";

import Modal from "components/Modal/Modal";
import TextBox from "components/TextBox";
import LabelSearchWithGoogle from "./LabelSearchWithGoogle";
import SearchList from "./SearchList";

import * as Keys from "constants/keys";
import { GOOGLE_SEARCH_URL } from "constants/search-urls";
import { Category, Link, SearchItem } from "types";

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
  items: SearchItem[];
}) {
  const autoFocusRef = useAutoFocus();

  // TODO: peristance
  const [canSearchLink, setCanSearchLink] = useState<boolean>(true);
  const [canSearchCategory, setCanSearchCategory] = useState<boolean>(true);

  const [search, setSearch] = useState<string>("");
  const [cursor, setCursor] = useState<number>(0);

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

  useHotkeys(Keys.ARROW_LEFT, () => {
    console.log("left");
  });

  useHotkeys(Keys.ARROW_RIGHT, () => {
    console.log("right");
  });

  const handleSearchInputChange = useCallback((value) => {
    setSearch(value);
    setCursor(0);
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
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
    <Modal title="Rechercher" close={close} noHeader padding={"0"}>
      <form onSubmit={handleSubmit} className={styles["search-form"]}>
        <div className={styles["search-input-wrapper"]}>
          <label htmlFor="search">
            <BsSearch size={24} />
          </label>
          <TextBox
            name="search"
            onChangeCallback={handleSearchInputChange}
            value={search}
            placeholder="Rechercher"
            innerRef={autoFocusRef}
            fieldClass={styles["search-input-field"]}
            inputClass={"reset"}
          />
        </div>
        <SearchFilter
          canSearchLink={canSearchLink}
          setCanSearchLink={setCanSearchLink}
          canSearchCategory={canSearchCategory}
          setCanSearchCategory={setCanSearchCategory}
        />
        {search.length > 0 && (
          <SearchList
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

function SearchFilter({
  canSearchLink,
  setCanSearchLink,
  canSearchCategory,
  setCanSearchCategory,
}: {
  canSearchLink: boolean;
  setCanSearchLink: (value: boolean) => void;
  canSearchCategory: boolean;
  setCanSearchCategory: (value: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "1em",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1em",
      }}
    >
      {/* à remplacer par des Chips Checkbox */}
      <div style={{ display: "flex", gap: ".25em" }}>
        <input
          type="checkbox"
          name="filter-link"
          id="filter-link"
          onChange={({ target }) => setCanSearchLink(target.checked)}
          checked={canSearchLink}
        />
        <label htmlFor="filter-link">liens</label>
      </div>
      <div style={{ display: "flex", gap: ".25em" }}>
        <input
          type="checkbox"
          name="filter-category"
          id="filter-category"
          onChange={({ target }) => setCanSearchCategory(target.checked)}
          checked={canSearchCategory}
        />
        <label htmlFor="filter-category">categories</label>
      </div>
    </div>
  );
}
