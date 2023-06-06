import PATHS from "constants/paths";
import { SideMenuProps } from "./SideMenu";

import ButtonLink from "components/ButtonLink";
import styles from "./sidemenu.module.scss";

export default function NavigationLinks({
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
        <ButtonLink onClick={openSearchModal}>Rechercher</ButtonLink>
        <kbd>S</kbd>
      </div>
      <div className={styles["action"]}>
        <ButtonLink href={PATHS.CATEGORY.CREATE}>Créer categorie</ButtonLink>
        <kbd>C</kbd>
      </div>
      <div className={styles["action"]}>
        <ButtonLink
          href={`${PATHS.LINK.CREATE}?categoryId=${categoryActive.id}`}
        >
          Créer lien
        </ButtonLink>
        <kbd>L</kbd>
      </div>
    </div>
  );
}
