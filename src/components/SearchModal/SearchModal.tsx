import Modal from "components/Modal/Modal";
import TextBox from "components/TextBox";
import { GOOGLE_SEARCH_URL } from "constants/search-urls";
import useAutoFocus from "hooks/useAutoFocus";
import { useLocalStorage } from "hooks/useLocalStorage";
import { useTranslation } from "next-i18next";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { Category, SearchItem } from "types";
import LabelSearchWithGoogle from "./LabelSearchWithGoogle";
import SearchList from "./SearchList";
import styles from "./search.module.scss";

export default function SearchModal({
  close,
  handleSelectCategory,
  categories,
  items,
  noHeader = true,
}: {
  close: () => void;
  handleSelectCategory: (category: Category) => void;
  categories: Category[];
  items: SearchItem[];
  noHeader?: boolean;
}) {
  const { t } = useTranslation();
  const autoFocusRef = useAutoFocus();

  const [canSearchLink, setCanSearchLink] = useLocalStorage(
    "search-link",
    true,
  );
  const [canSearchCategory, setCanSearchCategory] = useLocalStorage(
    "search-category",
    false,
  );

  const [search, setSearch] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<SearchItem>(items[0]);

  const canSubmit = useMemo<boolean>(() => search.length > 0, [search]);

  // TODO: extract this code into utils function
  const itemsCompletion = useMemo(
    () =>
      search.length === 0
        ? []
        : items.filter(
            (item) =>
              ((item.type === "category" && canSearchCategory) ||
                (item.type === "link" && canSearchLink)) &&
              item.name
                .toLocaleLowerCase()
                .includes(search.toLocaleLowerCase().trim()),
          ),
    [canSearchCategory, canSearchLink, items, search],
  );

  const resetForm = useCallback(() => {
    setSearch("");
    close();
  }, [close]);

  const handleSearchInputChange = useCallback(
    (value: string) => setSearch(value),
    [],
  );

  const handleCanSearchLink = (checked: boolean) => setCanSearchLink(checked);
  const handleCanSearchCategory = (checked: boolean) =>
    setCanSearchCategory(checked);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      resetForm();

      if (itemsCompletion.length === 0) {
        return window.open(GOOGLE_SEARCH_URL + encodeURI(search.trim()));
      }

      const category = categories.find((c) => c.id === selectedItem.id);
      if (selectedItem.type === "category" && category) {
        return handleSelectCategory(category);
      }

      window.open(selectedItem.url);
    },
    [
      categories,
      handleSelectCategory,
      itemsCompletion.length,
      resetForm,
      search,
      selectedItem,
    ],
  );

  return (
    <Modal close={close} noHeader={noHeader} padding={"0"}>
      <form onSubmit={handleSubmit} className={styles["search-form"]}>
        <div className={styles["search-input-wrapper"]}>
          <label htmlFor="search">
            <BsSearch size={24} />
          </label>
          <TextBox
            name="search"
            onChangeCallback={handleSearchInputChange}
            value={search}
            placeholder={t("common:search")}
            innerRef={autoFocusRef}
            fieldClass={styles["search-input-field"]}
            inputClass={"reset"}
          />
        </div>
        <SearchFilter
          canSearchLink={canSearchLink}
          setCanSearchLink={handleCanSearchLink}
          canSearchCategory={canSearchCategory}
          setCanSearchCategory={handleCanSearchCategory}
        />
        {search.length > 0 && (
          <SearchList
            items={itemsCompletion}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            noItem={<LabelSearchWithGoogle />}
            closeModal={close}
          />
        )}
        <button type="submit" disabled={!canSubmit} style={{ display: "none" }}>
          {t("common:confirm")}
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
  const { t } = useTranslation();

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
      <div style={{ display: "flex", gap: ".25em" }}>
        <input
          type="checkbox"
          name="filter-link"
          id="filter-link"
          onChange={({ target }) => setCanSearchLink(target.checked)}
          checked={canSearchLink}
        />
        <label htmlFor="filter-link">{t("common:link.links")}</label>
      </div>
      <div style={{ display: "flex", gap: ".25em" }}>
        <input
          type="checkbox"
          name="filter-category"
          id="filter-category"
          onChange={({ target }) => setCanSearchCategory(target.checked)}
          checked={canSearchCategory}
        />
        <label htmlFor="filter-category">
          {t("common:category.categories")}
        </label>
      </div>
    </div>
  );
}
