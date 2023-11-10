import BlockWrapper from "components/BlockWrapper/BlockWrapper";
import * as Keys from "constants/keys";
import { useHotkeys } from "react-hotkeys-hook";
import { Category, Link } from "types";
import Categories from "./Categories/Categories";
import Favorites from "./Favorites/Favorites";
import NavigationLinks from "./NavigationLinks";
import UserCard from "./UserCard/UserCard";
import styles from "./sidemenu.module.scss";

export interface SideMenuProps {
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
        <NavigationLinks
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
