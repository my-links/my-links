import LinkTag from "next/link";

import BlockWrapper from "components/BlockWrapper/BlockWrapper";
import Categories from "./Categories/Categories";
import Favorites from "./Favorites/Favorites";
import UserCard from "./UserCard/UserCard";

import * as Keys from "constants/keys";
import PATHS from "constants/paths";
import { Category, Link } from "types";

import { useHotkeys } from "react-hotkeys-hook";
import styles from "./sidemenu.module.scss";

interface SideMenuProps {
  categories: Category[];
  favorites: Link[];
  handleSelectCategory: (category: Category) => void;
  categoryActive: Category;
  openSearchModal: () => void;
  isModalShowing: boolean;
}
export default function SideMenu({
  categories,
  favorites,
  handleSelectCategory,
  categoryActive,
  openSearchModal,
  isModalShowing = false,
}: SideMenuProps) {
  useHotkeys(
    Keys.ARROW_UP,
    () => {
      const currentCategoryIndex = categories.findIndex(
        ({ id }) => id === categoryActive.id
      );
      if (currentCategoryIndex === -1 || currentCategoryIndex === 0) return;

      handleSelectCategory(categories[currentCategoryIndex - 1]);
    },
    { enabled: !isModalShowing }
  );

  useHotkeys(
    Keys.ARROW_DOWN,
    () => {
      const currentCategoryIndex = categories.findIndex(
        ({ id }) => id === categoryActive.id
      );
      if (
        currentCategoryIndex === -1 ||
        currentCategoryIndex === categories.length - 1
      )
        return;

      handleSelectCategory(categories[currentCategoryIndex + 1]);
    },
    { enabled: !isModalShowing }
  );

  return (
    <div className={styles["side-menu"]}>
      <BlockWrapper>
        <Favorites favorites={favorites} />
      </BlockWrapper>
      <BlockWrapper style={{ minHeight: "0", flex: "1" }}>
        <Categories
          categories={categories}
          categoryActive={categoryActive}
          handleSelectCategory={handleSelectCategory}
        />
      </BlockWrapper>
      <BlockWrapper>
        <MenuControls
          categoryActive={categoryActive}
          openSearchModal={openSearchModal}
        />
      </BlockWrapper>
      <BlockWrapper>
        <UserCard />
      </BlockWrapper>
    </div>
  );
}

function MenuControls({
  categoryActive,
  openSearchModal,
}: {
  categoryActive: SideMenuProps["categoryActive"];
  openSearchModal: SideMenuProps["openSearchModal"];
}) {
  const handleOpenSearchModal = (event) => {
    event.preventDefault();
    openSearchModal();
  };
  return (
    <div className={styles["menu-controls"]}>
      <div className={styles["action"]}>
        <LinkTag href={"/#"} onClick={handleOpenSearchModal}>
          Rechercher
        </LinkTag>
        <kbd>S</kbd>
      </div>
      <div className={styles["action"]}>
        <LinkTag href={PATHS.CATEGORY.CREATE}>Créer categorie</LinkTag>
        <kbd>C</kbd>
      </div>
      <div className={styles["action"]}>
        <LinkTag href={`${PATHS.LINK.CREATE}?categoryId=${categoryActive.id}`}>
          Créer lien
        </LinkTag>
        <kbd>L</kbd>
      </div>
    </div>
  );
}
