import LinkTag from "next/link";

import BlockWrapper from "components/BlockWrapper/BlockWrapper";
import Categories from "./Categories/Categories";
import Favorites from "./Favorites/Favorites";
import UserCard from "./UserCard/UserCard";

import { Category, Link } from "types";
import PATHS from "constants/paths";

import styles from "./sidemenu.module.scss";

interface SideMenuProps {
  categories: Category[];
  favorites: Link[];
  handleSelectCategory: (category: Category) => void;
  categoryActive: Category;
  openSearchModal: () => void;
}
export default function SideMenu({
  categories,
  favorites,
  handleSelectCategory,
  categoryActive,
  openSearchModal,
}: SideMenuProps) {
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
