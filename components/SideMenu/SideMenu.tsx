import LinkTag from "next/link";

import BlockWrapper from "../BlockWrapper/BlockWrapper";
import Categories from "./Categories/Categories";
import Favorites from "./Favorites/Favorites";
import UserCard from "./UserCard/UserCard";

import { Category, Link } from "../../types";

import styles from "./sidemenu.module.scss";

interface SideMenuProps {
  categories: Category[];
  favorites: Link[];
  handleSelectCategory: (category: Category) => void;
  categoryActive: Category;
}
export default function SideMenu({
  categories,
  favorites,
  handleSelectCategory,
  categoryActive,
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
        <MenuControls categoryActive={categoryActive} />
      </BlockWrapper>
      <BlockWrapper>
        <UserCard />
      </BlockWrapper>
    </div>
  );
}

function MenuControls({
  categoryActive,
}: {
  categoryActive: SideMenuProps["categoryActive"];
}) {
  return (
    <div className={styles["menu-controls"]}>
      <div className={styles["action"]}>
        <LinkTag href={"/search"}>Rechercher</LinkTag>
        <kbd>S</kbd>
      </div>
      <div className={styles["action"]}>
        <LinkTag href={"/category/create"}>Créer categorie</LinkTag>
        <kbd>C</kbd>
      </div>
      <div className={styles["action"]}>
        <LinkTag href={`/link/create?categoryId=${categoryActive.id}`}>
          Créer lien
        </LinkTag>
        <kbd>L</kbd>
      </div>
    </div>
  );
}
